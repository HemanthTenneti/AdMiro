import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.DATABASE_URL ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/admiro";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const dropIndex = async () => {
  try {
    const collection = mongoose.connection.collection(
      "displayconnectionrequests"
    );

    // List all indexes
    const indexes = await collection.getIndexes();
    console.log("📋 Current indexes:");
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`  - ${name}:`, spec);
    });

    // Drop the macAddress unique index if it exists
    const macAddressIndexName = "displayInfo.macAddress_1";
    if (indexes[macAddressIndexName]) {
      await collection.dropIndex(macAddressIndexName);
      console.log(`✅ Dropped index: ${macAddressIndexName}`);
    } else {
      console.log(`⚠️  Index ${macAddressIndexName} not found`);
    }

    // List indexes after dropping
    console.log("\n📋 Indexes after cleanup:");
    const updatedIndexes = await collection.getIndexes();
    Object.entries(updatedIndexes).forEach(([name, spec]) => {
      console.log(`  - ${name}:`, spec);
    });

    console.log("\n✅ Index cleanup complete!");
  } catch (error) {
    console.error("❌ Error dropping index:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

const main = async () => {
  await connectDB();
  await dropIndex();

  // Force exit after 5 seconds if still hanging
  setTimeout(() => {
    console.log("⏱️  Force closing connection...");
    process.exit(0);
  }, 5000);
};

main();
