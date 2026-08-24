require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

const resetAgents = async () => {
  try {
    await connectDB();

    const result = await User.updateMany(
      { role: "delivery_agent" },
      {
        $set: {
          isAvailable: true,
          isActive: true,
        },
      }
    );

    console.log("Agents reset successfully");
    console.log("Agents updated:", result.modifiedCount);

    const agents = await User.find({
      role: "delivery_agent",
    }).select("name email role isAvailable isActive");

    console.log("Current agents:");
    console.log(agents);

    process.exit(0);
  } catch (error) {
    console.error("Agent reset error:", error.message);
    process.exit(1);
  }
};

resetAgents();