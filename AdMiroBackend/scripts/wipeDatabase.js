import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const wipeDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(process.env.DATABASE_URL);

    console.log("✅ Connected to MongoDB");

    // Get all collection names
    console.log("\n🗑️  Wiping all collections...");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("  📭 No collections found");
    } else {
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
        console.log(`  ✅ Cleared: ${collection.name}`);
      }
      console.log(`\n🎉 Successfully wiped ${collections.length} collections!`);
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

wipeDatabase();
