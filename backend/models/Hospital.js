const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    nameBangla: {
      type: String,
      required: false
    },
    code: {
      type: Number,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: false
    },
    agency: {
      type: String,
      required: false,
      index: true
    },
    type: {
      type: String,
      required: false,
      index: true
    },
    division: {
      type: String,
      required: false,
      index: true
    },
    district: {
      type: String,
      required: false,
      index: true
    },
    cityCorporation: {
      type: String,
      required: false
    },
    upazila: {
      type: String,
      required: false,
      index: true
    },
    paurasava: {
      type: String,
      required: false
    },
    union: {
      type: String,
      required: false
    },
    private: {
      type: Boolean,
      required: false,
      default: false,
      index: true
    },
    score: {
      type: Number,
      required: false,
      default: 50,
      min: 0,
      max: 100,
      index: true
    },
    specialties: {
      type: [String],
      default: []
    },
    // Per-specialty scores: { cardiac: 85, burn: 60, ... }
    emergencyCriteria: {
      type: Map,
      of: { type: Number, min: 0, max: 100 },
      default: {}
    },
    latitude: {
      type: Number,
      required: false,
      default: null
    },
    longitude: {
      type: Number,
      required: false,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'hospitals'
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
