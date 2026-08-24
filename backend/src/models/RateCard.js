const mongoose = require("mongoose");

const rateCardSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true,
    },

    zoneType: {
      type: String,
      enum: ["INTRA_ZONE", "INTER_ZONE"],
      required: true,
    },

    ratePerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    codSurcharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RateCard", rateCardSchema);