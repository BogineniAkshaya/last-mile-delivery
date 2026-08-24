const { sendStatusEmail } = require("../services/emailService");
const Order = require("../models/Order");
const Tracking = require("../models/Tracking");
const User = require("../models/User");


const allowedStatuses = [
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
];

const updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, remarks } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid delivery status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "FAILED") {
      order.rescheduledDate = null;
    }

    await order.save();

    await Tracking.create({
      order: order._id,
      status,
      actor: req.user.id,
      remarks,
    });

    // Make agent available again after final delivery attempt
    if (
      order.assignedAgent &&
      (status === "DELIVERED" || status === "FAILED")
    ) {
      await User.findByIdAndUpdate(order.assignedAgent, {
        isAvailable: true,
      });
    }

    res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTrackingHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const history = await Tracking.find({
      order: orderId,
    })
      .populate("actor", "name role")
      .sort({ createdAt: 1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rescheduleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({
        message: "New delivery date is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "FAILED") {
      return res.status(400).json({
        message: "Only failed orders can be rescheduled",
      });
    }

    // Make the previously assigned agent available again
    if (order.assignedAgent) {
      await User.findByIdAndUpdate(order.assignedAgent, {
        isAvailable: true,
      });
    }

    // Find another available delivery agent
    let newAgent = await User.findOne({
      role: "delivery_agent",
      isAvailable: true,
      isActive: true,
      _id: { $ne: order.assignedAgent },
    });

    // If no other agent exists, use the previously assigned agent
    if (!newAgent && order.assignedAgent) {
      newAgent = await User.findById(order.assignedAgent);
    }

    if (!newAgent) {
      return res.status(400).json({
        message: "No available delivery agent for rescheduled order",
      });
    }

    // Assign new agent
    order.assignedAgent = newAgent._id;
    order.status = "RESCHEDULED";
    order.rescheduledDate = new Date(newDate);

    await order.save();

    // New agent becomes unavailable while handling this order
    newAgent.isAvailable = false;
    await newAgent.save();

    await Tracking.create({
      order: order._id,
      status: "RESCHEDULED",
      actor: req.user.id,
      remarks: `Delivery rescheduled for ${newDate}. Agent reassigned to ${newAgent.name}.`,
    });

    res.json({
      message: `Order rescheduled successfully. Agent reassigned to ${newAgent.name}`,
      order,
      assignedAgent: newAgent.name,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updateStatus,
  getTrackingHistory,
  rescheduleOrder,
};