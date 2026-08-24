const Order = require("../models/Order");
const Zone = require("../models/Zone");
const calculateRate = require("../services/rateCalculator");

const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      pickupZone,
      dropZone,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType,
    } = req.body;

    if (
      !pickupAddress ||
      !dropAddress ||
      !pickupZone ||
      !dropZone ||
      !length ||
      !breadth ||
      !height ||
      !actualWeight ||
      !orderType ||
      !paymentType
    ) {
      return res.status(400).json({
        message: "All order details are required",
      });
    }

    const pickupZoneExists = await Zone.findById(pickupZone);
    const dropZoneExists = await Zone.findById(dropZone);

    if (!pickupZoneExists || !dropZoneExists) {
      return res.status(400).json({
        message: "Invalid pickup or drop zone",
      });
    }

    const rate = await calculateRate({
      pickupZone,
      dropZone,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType,
    });

    const order = await Order.create({
      customer: req.user.id,

      pickupAddress,
      dropAddress,

      pickupZone,
      dropZone,

      dimensions: {
        length,
        breadth,
        height,
      },

      actualWeight,
      volumetricWeight: rate.volumetricWeight,
      chargeableWeight: rate.chargeableWeight,

      orderType,
      paymentType,

      codSurcharge: rate.codSurcharge,
      deliveryCharge: rate.deliveryCharge,
      totalCharge: rate.totalCharge,

      status: "CREATED",
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
      pricing: {
        volumetricWeight: rate.volumetricWeight,
        chargeableWeight: rate.chargeableWeight,
        deliveryCharge: rate.deliveryCharge,
        codSurcharge: rate.codSurcharge,
        totalCharge: rate.totalCharge,
        zoneType: rate.zoneType,
      },
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email phone")
      .populate("pickupZone", "name")
      .populate("dropZone", "name")
      .populate("assignedAgent", "name phone");

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
};