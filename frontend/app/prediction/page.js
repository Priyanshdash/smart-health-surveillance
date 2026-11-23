'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

const RISK_STYLES = {
  HIGH:   { card: 'border-l-4 border-red-400 bg-red-50',   badge: 'bg-red-100 text-red-700',   dot: 'bg-red-500',    text: 'text-red-600'   },
  MEDIUM: { card: 'border-l-4 border-yellow-400 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', text: 'text-yellow-600' },
  LOW:    { card: 'border-l-4 border-green-400 bg-green-50',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  text: 'text-green-600'  },
};

const SUMMARY_STYLES = {
  HIGH:   'bg-red-50 border border-red-200',
  MEDIUM: 'bg-yellow-50 border border-yellow-200',
  LOW:    'bg-green-50 border border-green-200',
};

export default function PredictionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [villages, setVillages] = useState([]);
  const [villageFilter, setVillageFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));
    loadPredictions();
  }, [router]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/individual-predictions');
      setAllData(data);
      setFiltered(data);
      setVillages([...new Set(data.map(d => d.villageName))]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = allData;
    if (villageFilter !== 'all') result = result.filter(d => d.villageName === villageFilter);
    if (riskFilter !== 'all') result = result.filter(d => d.riskLevel === riskFilter);
    setFiltered(result);
  }, [villageFilter, riskFilter, allData]);

  const count = (level) => allData.filter(d => d.riskLevel === level).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f2ff]">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-md mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-indigo-600">Individual Risk Predictions</h1>
          <p className="text-gray-500 text-sm mt-1">AI-generated risk assessment per patient report</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['HIGH', 'HIGH RISK'], ['MEDIUM', 'MEDIUM RISK'], ['LOW', 'LOW RISK']].map(([level, label]) => (
            <div key={level} className={`rounded-2xl p-5 text-center ${SUMMARY_STYLES[level]}`}>
              <p className={`text-4xl font-bold ${RISK_STYLES[level].text}`}>{count(level)}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className={`w-2 h-2 rounded-full ${RISK_STYLES[level].dot}`}></span>
                <span className={`text-xs font-semibold ${RISK_STYLES[level].text}`}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-5 grid grid-cols-2 gap-3">
          <select className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
            <option value="all">All Villages</option>
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-3">Showing {filtered.length} patient{filtered.length !== 1 ? 's' : ''}</p>

        {/* Patient Cards */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading predictions...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
            No reports found. Submit health reports to see predictions.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => {
              const s = RISK_STYLES[p.riskLevel] || RISK_STYLES.LOW;
              return (
                <div key={p._id} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${s.card}`}>
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${s.badge}`}>
                          {p.riskLevel === 'HIGH' ? '⚠' : p.riskLevel === 'MEDIUM' ? '●' : '✓'} {p.riskLevel} RISK
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${s.text}`}>{p.confidenceScore}%</span>
                        <p className="text-xs text-gray-400">Confidence</p>
                      </div>
                    </div>

                    {/* Patient name & info */}
                    <p className="text-lg font-bold text-gray-800">{p.patientName}</p>
                    <p className="text-xs text-gray-400 mb-4">
                      {p.villageName}, {p.district}
                      {p.patientAge ? ` · Age ${p.patientAge}` : ''}
                      {p.gender ? ` · ${p.gender.toLowerCase()}` : ''}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Predicted Disease */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Predicted Disease</p>
                        <p className={`font-bold text-sm ${s.text}`}>{p.predictedDisease}</p>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Symptoms</p>
                        <div className="flex flex-wrap gap-1">
                          {p.symptoms.map((sym, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                              {sym.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Analysis</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{p.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
