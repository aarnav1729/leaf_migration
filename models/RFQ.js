// models/RFQ.js

const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema(
  {
    RFQNumber: { type: String, required: true, unique: true },
    shortName: { type: String },
    companyType: { type: String },
    sapOrder: { type: String },
    itemType: { type: String },
    customerName: { type: String },
    originLocation: { type: String },
    dropLocationState: { type: String },
    dropLocationDistrict: { type: String },
    address: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v);
        },
        message: props => `${props.value} is not a valid pincode. It should be exactly 6 digits.`,
      },
    },
    vehicleType: { type: String },
    additionalVehicleDetails: { type: String },
    numberOfVehicles: { type: Number },
    weight: { type: String },
    budgetedPriceBySalesDept: { type: Number },
    maxAllowablePrice: { type: Number },
    eReverseDate: { type: Date },
    eReverseTime: { type: String },
    vehiclePlacementBeginDate: { type: Date },
    vehiclePlacementEndDate: { type: Date },
    status: {
      type: String,
      enum: ["initial", "evaluation", "closed"],
      default: "initial",
    },
    initialQuoteEndTime: { type: Date, required: true },
    evaluationEndTime: { type: Date, required: true },
    finalizeReason: { type: String },
    l1Price: { type: Number },
    l1VendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    RFQClosingDate: { type: Date },
    RFQClosingTime: { type: String, required: true },
    eReverseToggle: { type: Boolean, default: false },
    rfqType: { type: String, enum: ["Long Term", "D2D"], default: "D2D" },
    selectedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
    vendorActions: [
      {
        action: { type: String }, // e.g., "addedAtCreation", "added", "reminderSent"
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model('RFQ', rfqSchema);
