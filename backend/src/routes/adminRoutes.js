const express = require("express");

const {
  createZone,
  updateZone,
  getZones,
  createRateCard,
  updateRateCard,
  getRateCards,
  getAllOrders,
  overrideOrderStatus,
} = require("../controllers/adminController");

const protect = require("../middleware/auth");

const router = express.Router();

router.post("/zones", protect, createZone);
router.get("/zones", protect, getZones);
router.put("/zones/:id", protect, updateZone);

router.post("/rate-cards", protect, createRateCard);
router.get("/rate-cards", protect, getRateCards);
router.put("/rate-cards/:id", protect, updateRateCard);

router.get("/orders", protect, getAllOrders);
router.put("/orders/:id/status", protect, overrideOrderStatus);

module.exports = router;