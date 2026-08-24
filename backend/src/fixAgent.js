require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const fixAgent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const hashedPassword = await bcrypt.hash("Agent12345", 10);

    const agent = await User.findOneAndUpdate(
      { email: "agent2@lastmile.com" },
      {
        $set: {
          password: hashedPassword,
          role: "delivery_agent",
          isActive: true,
          isAvailable: true,
        },
      },
      { new: true }
    );

    if (!agent) {
      console.log("Agent not found");
      process.exit(1);
    }

    console.log("Agent password reset successfully");
    console.log("Email: agent2@lastmile.com");
    console.log("Password: Agent12345");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

fixAgent();