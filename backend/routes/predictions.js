const express = require('express');
const HealthReport = require('../models/HealthReport');
const OutbreakPrediction = require('../models/OutbreakPrediction');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.post('/predict', async (req, res) => {
  try {
    const { village } = req.body;
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();

    const query = { date: { $gte: weekStart, $lte: weekEnd } };
    if (village) query.villageName = village;

    const reports = await HealthReport.find(query);

    if (reports.length === 0) {
      return res.status(400).json({ error: 'No reports found for the past week' });
    }

    const aggregatedData = aggregateReports(reports);
    const prediction = await aiService.predictOutbreak(aggregatedData);

    const outbreakPrediction = new OutbreakPrediction({
      district: village || 'All Villages',
      weekStart,
      weekEnd,
      riskLevel: prediction.riskLevel,
      confidenceScore: prediction.confidenceScore,
      predictedDisease: prediction.predictedDisease,
      explanation: prediction.explanation,
      totalCases: aggregatedData.totalCases,
      affectedVillages: aggregatedData.villages,
      dataSnapshot: aggregatedData
    });

    await outbreakPrediction.save();
    res.json(outbreakPrediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/predictions', async (req, res) => {
  try {
    const { district, limit = 10 } = req.query;
    const query = district ? { district } : {};
    const predictions = await OutbreakPrediction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Per-patient individual risk predictions
router.get('/individual-predictions', async (req, res) => {
  try {
    const { village, riskLevel } = req.query;
    const query = {};
    if (village) query.villageName = village;
    const allReports = await HealthReport.find(query).sort({ createdAt: -1 }).limit(100);

    const results = allReports.map(r => {
      const symptoms = r.symptoms || [];
      const highRiskSymptoms = ['diarrhea', 'Diarrhea', 'vomiting', 'Vomiting', 'jaundice', 'Jaundice'];
      const medRiskSymptoms = ['fever', 'Fever', 'abdominal_pain', 'Abdominal Pain', 'nausea', 'Nausea'];
      const highCount = symptoms.filter(s => highRiskSymptoms.includes(s)).length;
      const medCount = symptoms.filter(s => medRiskSymptoms.includes(s)).length;

      let risk, confidence, disease, analysis;
      if (highCount >= 2 || (highCount >= 1 && r.sanitationLevel === 'low')) {
        risk = 'HIGH';
        confidence = Math.min(70 + highCount * 10 + medCount * 5, 100);
        disease = highCount >= 2 && symptoms.some(s => ['jaundice','Jaundice'].includes(s)) ? 'Suspected Hepatitis A' :
                  highCount >= 2 ? 'Suspected Cholera' : 'Suspected Typhoid';
        analysis = `Patient presents with: ${symptoms.join(', ').toLowerCase()}. Environmental factors: ${r.sanitationLevel} sanitation, ${r.rainfallLevel} rainfall, ${r.waterSourceType} water source.${
          r.waterQuality ? ' Water quality: NOT POTABLE — contaminated water detected.' : ''} High individual risk — immediate medical attention recommended.`;
      } else if (highCount === 1 || medCount >= 2) {
        risk = 'MEDIUM';
        confidence = Math.min(50 + medCount * 8 + highCount * 10, 85);
        disease = 'Suspected Diarrheal Disease';
        analysis = `Patient presents with: ${symptoms.join(', ').toLowerCase()}. Moderate risk based on symptom pattern and environmental conditions.`;
      } else {
        risk = 'LOW';
        confidence = Math.max(30 + medCount * 5, 20);
        disease = 'No significant risk';
        analysis = `Patient presents with: ${symptoms.join(', ').toLowerCase()}. Low risk — monitor for symptom progression.`;
      }

      return {
        _id: r._id,
        patientName: r.patientName || 'Unknown',
        patientAge: r.patientAge,
        gender: r.gender || '',
        villageName: r.villageName,
        district: r.district,
        symptoms: r.symptoms,
        riskLevel: risk,
        confidenceScore: confidence,
        predictedDisease: disease,
        explanation: analysis,
        createdAt: r.createdAt || r.date
      };
    });

    const filtered = riskLevel && riskLevel !== 'all' ? results.filter(r => r.riskLevel === riskLevel) : results;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function aggregateReports(reports) {
  const symptomCounts = {};
  const villages = new Set();
  const waterSources = {};
  let totalCases = 0;
  let lowSanitation = 0;
  let highRainfall = 0;

  reports.forEach(report => {
    villages.add(report.villageName);
    totalCases += report.numberOfCasesReported;

    report.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + report.numberOfCasesReported;
    });

    waterSources[report.waterSourceType] = (waterSources[report.waterSourceType] || 0) + 1;

    if (report.sanitationLevel === 'low') lowSanitation++;
    if (report.rainfallLevel === 'high') highRainfall++;
  });

  return {
    totalCases,
    villages: Array.from(villages),
    villageCount: villages.size,
    symptomCounts,
    waterSources,
    lowSanitationCount: lowSanitation,
    highRainfallCount: highRainfall,
    reportCount: reports.length,
    averageCasesPerReport: (totalCases / reports.length).toFixed(2)
  };
}

module.exports = router;
