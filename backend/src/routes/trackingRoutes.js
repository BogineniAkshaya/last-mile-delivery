const express = require("express");

const {
  updateStatus,
  getTrackingHistory,
  rescheduleOrder,
} = require("../controllers/trackingController");

const protect = require("../middleware/auth");

const router = express.Router();

router.put("/:orderId/status", protect, updateStatus);

router.get("/:orderId", protect, getTrackingHistory);

router.put("/:orderId/reschedule", protect, rescheduleOrder);

module.exports = router;