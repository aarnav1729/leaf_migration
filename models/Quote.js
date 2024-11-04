// models/Quote.js

const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ", required: true },
    vendorName: { type: String, required: true },
    price: { type: Number, required: true },
    message: { type: String },
    numberOfTrucks: { type: Number, required: true },
    validityPeriod: { type: String },
    label: { type: String },
    trucksAllotted: { type: Number, default: 0 },
    numberOfVehiclesPerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
