const User = require("../models/User");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findNearestAgent = async (latitude, longitude) => {
  const agents = await User.find({
    role: "delivery_agent",
    isAvailable: true,
    isActive: true,
  });

  if (!agents.length) {
    throw new Error("No available delivery agents");
  }

  let nearestAgent = null;
  let shortestDistance = Infinity;

  for (const agent of agents) {
    if (
      !agent.currentLocation ||
      agent.currentLocation.latitude === undefined ||
      agent.currentLocation.longitude === undefined
    ) {
      continue;
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      agent.currentLocation.latitude,
      agent.currentLocation.longitude
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestAgent = agent;
    }
  }

  if (!nearestAgent) {
    throw new Error("No available agent with location");
  }

  return {
    agent: nearestAgent,
    distance: shortestDistance,
  };
};

module.exports = {
  findNearestAgent,
  calculateDistance,
};