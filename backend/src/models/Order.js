const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },

    dropAddress: {
      type: String,
      required: true,
      trim: true,
    },

    pickupZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },

    dropZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },

    dimensions: {
      length: {
        type: Number,
        required: true,
      },
      breadth: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },

    actualWeight: {
      type: Number,
      required: true,
    },

    volumetricWeight: {
      type: Number,
      required: true,
    },

    chargeableWeight: {
      type: Number,
      required: true,
    },

    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["PREPAID", "COD"],
      required: true,
    },

    codSurcharge: {
      type: Number,
      default: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
    },

    totalCharge: {
      type: Number,
      required: true,
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RESCHEDULED",
      ],
      default: "CREATED",
    },

    rescheduledDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);