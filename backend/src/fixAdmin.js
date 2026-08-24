require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const admin = await User.findOne({
      email: "admin@lastmile.com",
    });

    if (!admin) {
      console.log("Admin not found");
      process.exit(1);
    }

    admin.name = "System Admin";
    admin.password = "Admin12345";
    admin.role = "admin";
    admin.isActive = true;
    admin.isAvailable = false;

    await admin.save();

    console.log("Admin fixed successfully");
    console.log("Email: admin@lastmile.com");
    console.log("Password: Admin12345");

    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
};

fixAdmin();