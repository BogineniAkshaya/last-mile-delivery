const express = require("express");

const {
  createAgent,
  updateAgentLocation,
  updateAvailability,
  autoAssignAgent,
  manualAssignAgent,
} = require("../controllers/agentController");

const protect = require("../middleware/auth");

const router = express.Router();

router.post("/create", protect, createAgent);

router.put("/location", protect, updateAgentLocation);

router.put("/availability", protect, updateAvailability);

router.post("/auto-assign", protect, autoAssignAgent);

router.post("/manual-assign", protect, manualAssignAgent);

module.exports = router;