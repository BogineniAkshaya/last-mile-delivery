require("dotenv").config();

const connectDB = require("./config/db");
const Zone = require("./models/Zone");
const RateCard = require("./models/RateCard");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing zones and rate cards
    await Zone.deleteMany({});
    await RateCard.deleteMany({});

    // Create zones
    const zones = await Zone.insertMany([
      {
        name: "Zone A",
        areas: ["Chennai Central", "Anna Nagar", "T Nagar"],
      },
      {
        name: "Zone B",
        areas: ["Velachery", "Tambaram", "Guindy"],
      },
      {
        name: "Zone C",
        areas: ["Avadi", "Ambattur", "Poonamallee"],
      },
    ]);

    // Create configurable rate cards
    await RateCard.insertMany([
      // B2C
      {
        orderType: "B2C",
        zoneType: "INTRA_ZONE",
        ratePerKg: 40,
        codSurcharge: 30,
      },
      {
        orderType: "B2C",
        zoneType: "INTER_ZONE",
        ratePerKg: 60,
        codSurcharge: 30,
      },

      // B2B
      {
        orderType: "B2B",
        zoneType: "INTRA_ZONE",
        ratePerKg: 30,
        codSurcharge: 20,
      },
      {
        orderType: "B2B",
        zoneType: "INTER_ZONE",
        ratePerKg: 50,
        codSurcharge: 20,
      },
    ]);

    console.log("Zones created:", zones.length);
    console.log("Rate cards created successfully");
    console.log("Seed data completed");

    process.exit(0);
  } catch (error) {
    console.error("Seed data error:", error.message);
    process.exit(1);
  }
};

seedData();