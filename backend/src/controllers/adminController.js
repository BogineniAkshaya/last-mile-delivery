const Zone = require("../models/Zone");
const RateCard = require("../models/RateCard");
const Order = require("../models/Order");

const createZone = async (req, res) => {
  try {
    const { name, areas } = req.body;

    const zone = await Zone.create({
      name,
      areas: areas || [],
    });

    res.status(201).json({
      message: "Zone created successfully",
      zone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateZone = async (req, res) => {
  try {
    const { name, areas, isActive } = req.body;

    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { name, areas, isActive },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({
        message: "Zone not found",
      });
    }

    res.json({
      message: "Zone updated successfully",
      zone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ name: 1 });

    res.json(zones);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createRateCard = async (req, res) => {
  try {
    const {
      orderType,
      zoneType,
      ratePerKg,
      codSurcharge,
    } = req.body;

    const rateCard = await RateCard.create({
      orderType,
      zoneType,
      ratePerKg,
      codSurcharge: codSurcharge || 0,
    });

    res.status(201).json({
      message: "Rate card created successfully",
      rateCard,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!rateCard) {
      return res.status(404).json({
        message: "Rate card not found",
      });
    }

    res.json({
      message: "Rate card updated successfully",
      rateCard,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRateCards = async (req, res) => {
  try {
    const rateCards = await RateCard.find({
      isActive: true,
    });

    res.json(rateCards);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, zone, agent } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (zone) {
      filter.$or = [
        { pickupZone: zone },
        { dropZone: zone },
      ];
    }

    if (agent) {
      filter.assignedAgent = agent;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate("pickupZone", "name")
      .populate("dropZone", "name")
      .populate("assignedAgent", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const overrideOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order status overridden",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createZone,
  updateZone,
  getZones,
  createRateCard,
  updateRateCard,
  getRateCards,
  getAllOrders,
  overrideOrderStatus,
};