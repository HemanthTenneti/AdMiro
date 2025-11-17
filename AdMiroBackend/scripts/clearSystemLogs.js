import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import SystemLog from "../src/models/SystemLog.js";

const clearSystemLogs = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to MongoDB");

    console.log("\n🗑️  Clearing SystemLog collection...");
    const result = await SystemLog.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} logs`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

clearSystemLogs();
