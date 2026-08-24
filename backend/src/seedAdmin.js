require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const existingAdmin = await User.findOne({
      email: "admin@lastmile.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin12345", 10);

    const admin = await User.create({
      name: "System Admin",
      email: "admin@lastmile.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
      isActive: true,
      isAvailable: false,
    });

    console.log("Admin created successfully");
    console.log("Email: admin@lastmile.com");
    console.log("Password: Admin12345");

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();