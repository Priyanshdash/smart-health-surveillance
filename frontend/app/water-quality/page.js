'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ButtonSpinner from '@/components/ButtonSpinner';

export default function WaterQualityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    ph: '',
    Hardness: '',
    Solids: '',
    Chloramines: '',
    Sulfate: '',
    Conductivity: '',
    Organic_carbon: '',
    Trihalomethanes: '',
    Turbidity: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      
      // Convert string values to numbers
      const payload = {};
      Object.keys(formData).forEach(key => {
        const value = parseFloat(formData[key]);
        if (!isNaN(value)) {
          payload[key] = value;
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/water-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Water quality check failed');
      }

      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to check water quality');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ph: '',
      Hardness: '',
      Solids: '',
      Chloramines: '',
      Sulfate: '',
      Conductivity: '',
      Organic_carbon: '',
      Trihalomethanes: '',
      Turbidity: ''
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            💧 Water Quality Testing
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enter water sample parameters to check potability and contamination risk.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* pH */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    pH Level (6.5 - 8.5)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    placeholder="e.g., 7.2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Hardness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hardness (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Hardness"
                    value={formData.Hardness}
                    onChange={handleChange}
                    placeholder="e.g., 150"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Solids (TDS) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Dissolved Solids (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Solids"
                    value={formData.Solids}
                    onChange={handleChange}
                    placeholder="e.g., 300"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Chloramines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chloramines (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Chloramines"
                    value={formData.Chloramines}
                    onChange={handleChange}
                    placeholder="e.g., 2.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Sulfate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sulfate (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Sulfate"
                    value={formData.Sulfate}
                    onChange={handleChange}
                    placeholder="e.g., 150"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Conductivity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conductivity (μS/cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Conductivity"
                    value={formData.Conductivity}
                    onChange={handleChange}
                    placeholder="e.g., 400"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Organic Carbon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organic Carbon (mg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Organic_carbon"
                    value={formData.Organic_carbon}
                    onChange={handleChange}
                    placeholder="e.g., 1.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Trihalomethanes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trihalomethanes (μg/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Trihalomethanes"
                    value={formData.Trihalomethanes}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Turbidity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Turbidity (NTU)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Turbidity"
                    value={formData.Turbidity}
                    onChange={handleChange}
                    placeholder="e.g., 3.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? <ButtonSpinner text="Analyzing..." /> : '🔬 Check Water Quality'}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-lg shadow-lg p-6 ${
              result.potable 
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' 
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  {result.potable ? '✅' : '⚠️'}
                </span>
                <div>
                  <h2 className={`text-2xl font-bold ${
                    result.potable ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {result.potable ? 'Water is POTABLE' : 'Water is NOT POTABLE'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Potability Score: {result.potabilityScore}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Risk Assessment
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          result.waterRiskScore < 0.3 ? 'bg-green-500' :
                          result.waterRiskScore < 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.waterRiskScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {(result.waterRiskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {result.violations && result.violations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                      ⚠️ Parameter Violations
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {result.violations.map((violation, index) => (
                        <li key={index}>{violation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Explanation
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
