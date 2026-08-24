const RateCard = require("../models/RateCard");

const calculateRate = async ({
  pickupZone,
  dropZone,
  length,
  breadth,
  height,
  actualWeight,
  orderType,
  paymentType,
}) => {
  const volumetricWeight = (length * breadth * height) / 5000;

  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  const zoneType =
    pickupZone.toString() === dropZone.toString()
      ? "INTRA_ZONE"
      : "INTER_ZONE";

  const rateCard = await RateCard.findOne({
    orderType,
    zoneType,
    isActive: true,
  });

  if (!rateCard) {
    throw new Error(
      `No active rate card found for ${orderType} ${zoneType}`
    );
  }

  const deliveryCharge = chargeableWeight * rateCard.ratePerKg;

  const codSurcharge =
    paymentType === "COD" ? rateCard.codSurcharge : 0;

  const totalCharge = deliveryCharge + codSurcharge;

  return {
    volumetricWeight,
    chargeableWeight,
    deliveryCharge,
    codSurcharge,
    totalCharge,
    zoneType,
  };
};

module.exports = calculateRate;