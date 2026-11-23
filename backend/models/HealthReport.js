const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  patientName: { type: String },
  phoneNumber: { type: String },
  dateOfOnset: { type: Date },
  gender: { type: String },
  hospitalVisited: { type: String },
  villageName: { type: String, required: true },
  district: { type: String, required: true },
  patientAge: { type: Number, required: true },
  symptoms: [{ type: String }],
  date: { type: Date, default: Date.now },
  waterSourceType: { type: String, enum: ['well', 'river', 'tank', 'pipeline'], required: true },
  numberOfCasesReported: { type: Number, default: 1 },
  sanitationLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  rainfallLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  waterQuality: { type: Object },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('HealthReport', healthReportSchema);
