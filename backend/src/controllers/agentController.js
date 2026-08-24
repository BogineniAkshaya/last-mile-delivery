const User = require("../models/User");
const Order = require("../models/Order");
const { findNearestAgent } = require("../services/assignmentService");

const createAgent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      latitude,
      longitude,
    } = req.body;

    const existingAgent = await User.findOne({ email });

    if (existingAgent) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const agent = await User.create({
      name,
      email,
      password,
      phone,
      role: "delivery_agent",
      currentLocation: {
        latitude,
        longitude,
      },
      isAvailable: true,
    });

    res.status(201).json({
      message: "Delivery agent created",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        isAvailable: agent.isAvailable,
        currentLocation: agent.currentLocation,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateAgentLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const agent = await User.findByIdAndUpdate(
      req.user.id,
      {
        currentLocation: {
          latitude,
          longitude,
        },
      },
      { new: true }
    );

    res.json({
      message: "Agent location updated",
      location: agent.currentLocation,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const agent = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    );

    res.json({
      message: "Agent availability updated",
      isAvailable: agent.isAvailable,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const autoAssignAgent = async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const result = await findNearestAgent(latitude, longitude);

    order.assignedAgent = result.agent._id;

    await order.save();

    // Make agent unavailable while handling the delivery
    result.agent.isAvailable = false;
    await result.agent.save();

    res.json({
      message: "Agent automatically assigned",
      agent: {
        id: result.agent._id,
        name: result.agent.name,
        phone: result.agent.phone,
      },
      distanceKm: Number(result.distance.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const manualAssignAgent = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;

    const order = await Order.findById(orderId);
    const agent = await User.findOne({
      _id: agentId,
      role: "delivery_agent",
      isActive: true,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    order.assignedAgent = agent._id;

    await order.save();

    agent.isAvailable = false;
    await agent.save();

    res.json({
      message: "Agent manually assigned",
      agent: {
        id: agent._id,
        name: agent.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAgent,
  updateAgentLocation,
  updateAvailability,
  autoAssignAgent,
  manualAssignAgent,
};