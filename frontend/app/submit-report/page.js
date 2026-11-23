'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { reports } from '@/lib/api';
import Navbar from '@/components/Navbar';

const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const Card = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

// Toast: type = 'success' | 'high-risk' | 'error'
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isHighRisk = toast.type === 'high-risk';
  const isMediumRisk = toast.type === 'medium-risk';
  const isError = toast.type === 'error';
  const bg = isHighRisk ? 'bg-red-600' : isMediumRisk ? 'bg-yellow-500' : isError ? 'bg-red-500' : 'bg-green-600';
  const icon = isHighRisk ? '⚠' : isMediumRisk ? '⚠' : isError ? '✕' : '✓';
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-start gap-3 ${bg} text-white px-5 py-4 rounded-xl shadow-2xl max-w-sm animate-slide-in`}>
      <span className="text-lg font-bold mt-0.5">{icon}</span>
      <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-lg leading-none ml-1">✕</button>
    </div>
  );
};

export default function SubmitReportPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [waterQualityResult, setWaterQualityResult] = useState(null);
  const [checkingWaterQuality, setCheckingWaterQuality] = useState(false);

  const emptyForm = {
    patientName: '', phoneNumber: '', dateOfOnset: '', patientAge: '', gender: 'Male',
    villageName: '', district: '',
    symptoms: [],
    waterSourceType: 'well', sanitationLevel: 'medium', rainfallLevel: 'medium', hospitalVisited: 'No',
    waterQuality: { ph: '', Hardness: '', Solids: '', Chloramines: '', Sulfate: '', Conductivity: '', Organic_carbon: '', Trihalomethanes: '', Turbidity: '' }
  };

  const [formData, setFormData] = useState(emptyForm);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 6000);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) router.push('/login');
    else setUser(JSON.parse(userData));
  }, [router]);

  const symptomOptions = ['Diarrhea', 'Fever', 'Vomiting', 'Jaundice', 'Abdominal Pain', 'Nausea', 'Headache'];

  const estimateRisk = (data) => {
    const highRiskSymptoms = ['Diarrhea', 'Vomiting', 'Jaundice'];
    const medRiskSymptoms = ['Fever', 'Abdominal Pain', 'Nausea'];
    const highCount = data.symptoms.filter(s => highRiskSymptoms.includes(s)).length;
    const medCount = data.symptoms.filter(s => medRiskSymptoms.includes(s)).length;
    if (highCount >= 2 || (highCount >= 1 && data.sanitationLevel === 'low')) return 'HIGH';
    if (highCount === 1 || medCount >= 2) return 'MEDIUM';
    return 'LOW';
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleWaterQualityChange = (field, value) => {
    setFormData(prev => ({ ...prev, waterQuality: { ...prev.waterQuality, [field]: value } }));
  };

  const checkWaterQuality = async () => {
    setCheckingWaterQuality(true);
    setWaterQualityResult(null);
    try {
      const payload = {};
      Object.keys(formData.waterQuality).forEach(key => {
        const value = parseFloat(formData.waterQuality[key]);
        if (!isNaN(value)) payload[key] = value;
      });
      const { data } = await api.post('/water-quality', payload);
      setWaterQualityResult(data);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to check water quality');
    } finally {
      setCheckingWaterQuality(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await reports.submit(formData);
      window.dispatchEvent(new CustomEvent('reportSubmitted'));

      const risk = estimateRisk(formData);
      const name = formData.patientName || 'the patient';
      const topSymptom = formData.symptoms[0] || 'symptoms';

      if (risk === 'HIGH') {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          [0, 0.3, 0.6].forEach(t => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880; osc.type = 'square';
            gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
            osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.25);
          });
        } catch (_) {}
        showToast('high-risk', `⚠ HIGH RISK: Suspected ${topSymptom} detected for ${name}. Immediate medical attention recommended.`);
      } else if (risk === 'MEDIUM') {
        showToast('medium-risk', `⚠ MEDIUM RISK: Possible ${topSymptom} detected for ${name}. Please monitor closely.`);
      } else {
        showToast('success', `✓ LOW RISK: Report for ${name} submitted successfully. No immediate concern detected.`);
      }

      setFormData(emptyForm);
      setWaterQualityResult(null);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit report';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const wqFields = [
    { key: 'ph', label: 'pH', placeholder: '7.2' },
    { key: 'Hardness', label: 'Hardness (mg/L)', placeholder: '150' },
    { key: 'Solids', label: 'Solids (ppm)', placeholder: '300' },
    { key: 'Chloramines', label: 'Chloramines (ppm)', placeholder: '2.5' },
    { key: 'Sulfate', label: 'Sulfate (mg/L)', placeholder: '150' },
    { key: 'Conductivity', label: 'Conductivity (μS/cm)', placeholder: '400' },
    { key: 'Organic_carbon', label: 'Organic Carbon (ppm)', placeholder: '1.5' },
    { key: 'Trihalomethanes', label: 'Trihalomethanes (μg/L)', placeholder: '50' },
    { key: 'Turbidity', label: 'Turbidity (NTU)', placeholder: '3.5' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2ff]">
      <Navbar user={user} />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-md mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600">Submit Health Report</h1>
          <p className="text-gray-500 text-sm mt-1">Report health cases and symptoms for early outbreak detection</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Location */}
          <Card icon="🔵" title="Location Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Village Name</label>
                <input type="text" required placeholder="Enter village name" className={inputClass}
                  value={formData.villageName} onChange={(e) => setFormData({ ...formData, villageName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>District</label>
                <input type="text" required placeholder="Enter district" className={inputClass}
                  value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
              </div>
            </div>
          </Card>

          {/* Patient Info */}
          <Card icon="🔴" title="Patient Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Patient Name</label>
                <input type="text" required placeholder="Full name" className={inputClass}
                  value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Contact Number</label>
                <input type="tel" required placeholder="Phone number" className={inputClass}
                  value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Patient Age</label>
                <input type="number" required min="0" max="120" placeholder="Age" className={inputClass}
                  value={formData.patientAge} onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select className={inputClass} value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Date of Symptom Onset</label>
              <input type="date" required className={inputClass}
                value={formData.dateOfOnset} onChange={(e) => setFormData({ ...formData, dateOfOnset: e.target.value })} />
            </div>
          </Card>

          {/* Symptoms */}
          <Card icon="🩺" title="Symptoms">
            <p className="text-sm text-gray-500 -mt-2">Symptoms (select all that apply)</p>
            <div className="grid grid-cols-3 gap-3">
              {symptomOptions.map(symptom => {
                const selected = formData.symptoms.includes(symptom);
                return (
                  <label key={symptom}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                      selected ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}>
                    <input type="checkbox" className="w-4 h-4 accent-red-500"
                      checked={selected} onChange={() => handleSymptomToggle(symptom)} />
                    {symptom}
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Environmental */}
          <Card icon="♻️" title="Environmental Factors">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Water Source</label>
                <select className={inputClass} value={formData.waterSourceType}
                  onChange={(e) => setFormData({ ...formData, waterSourceType: e.target.value })}>
                  <option value="well">🪣 Well</option>
                  <option value="river">🏞️ River</option>
                  <option value="tank">🛢️ Tank</option>
                  <option value="pipeline">🚰 Pipeline</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sanitation Level</label>
                <select className={inputClass} value={formData.sanitationLevel}
                  onChange={(e) => setFormData({ ...formData, sanitationLevel: e.target.value })}>
                  <option value="low">🔴 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟢 High</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Rainfall Level</label>
                <select className={inputClass} value={formData.rainfallLevel}
                  onChange={(e) => setFormData({ ...formData, rainfallLevel: e.target.value })}>
                  <option value="low">🟡 Low</option>
                  <option value="medium">🌦️ Medium</option>
                  <option value="high">🌧️ High</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Hospital Visited</label>
                <select className={inputClass} value={formData.hospitalVisited}
                  onChange={(e) => setFormData({ ...formData, hospitalVisited: e.target.value })}>
                  <option value="Yes">✅ Yes</option>
                  <option value="No">❌ No</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Water Quality */}
          <Card icon="🧪" title="Water Quality Test" subtitle="Optional — enter sensor readings to assess water safety">
            <div className="grid grid-cols-3 gap-3">
              {wqFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" step="0.01" placeholder={placeholder} className={inputClass}
                    value={formData.waterQuality[key]}
                    onChange={(e) => handleWaterQualityChange(key, e.target.value)} />
                </div>
              ))}
            </div>

            <button type="button" onClick={checkWaterQuality} disabled={checkingWaterQuality}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              <span>⊙</span> {checkingWaterQuality ? 'Analyzing...' : 'Check Water Quality'}
            </button>

            {waterQualityResult && (
              <div className={`rounded-xl p-4 border ${waterQualityResult.potable ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-bold text-sm flex items-center gap-1 ${waterQualityResult.potable ? 'text-green-700' : 'text-red-600'}`}>
                    {waterQualityResult.potable ? '✅ Water is POTABLE' : '✗ Water is NOT POTABLE'}
                  </p>
                  <span className={`font-bold text-sm ${waterQualityResult.potable ? 'text-green-700' : 'text-red-600'}`}>
                    {(waterQualityResult.waterRiskScore * 100).toFixed(1)}%
                  </span>
                </div>
                {waterQualityResult.violations?.length > 0 && (
                  <p className="text-xs text-red-700 mb-1">
                    Issues: {waterQualityResult.violations.join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-600">{waterQualityResult.explanation}</p>
              </div>
            )}
          </Card>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading || formData.symptoms.length === 0}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
            <span>⊙</span> {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
