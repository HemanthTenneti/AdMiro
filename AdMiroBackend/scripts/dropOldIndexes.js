import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dropOldIndexes = async () => {
  try {
    console.log("📊 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;

    console.log("🔍 Dropping old index: displayInfo.macAddress_1");
    try {
      await db
        .collection("displayconnectionrequests")
        .dropIndex("displayInfo.macAddress_1");
      console.log("✅ Successfully dropped displayInfo.macAddress_1 index");
    } catch (err) {
      if (err.message.includes("index not found")) {
        console.log(
          "ℹ️ Index displayInfo.macAddress_1 does not exist (already cleaned)"
        );
      } else {
        throw err;
      }
    }

    // List all remaining indexes
    console.log("\n📋 Remaining indexes on displayconnectionrequests:");
    const indexes = await db
      .collection("displayconnectionrequests")
      .getIndexes();
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`  - ${name}:`, spec);
    });

    console.log("\n✅ Index cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

dropOldIndexes();
