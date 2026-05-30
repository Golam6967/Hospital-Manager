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
    }
  },
  {
    timestamps: true,
    collection: 'hospitals'
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
