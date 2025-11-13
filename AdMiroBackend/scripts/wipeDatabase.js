require("dotenv").config();
const mongoose = require("mongoose");

const wipeDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      w: "majority",
      maxPoolSize: 5,
    });

    console.log("✅ Connected to MongoDB");

    // Drop all collections
    console.log("\n🗑️  Wiping all collections...");
    
    const collections = mongoose.connection.collections;
    let count = 0;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      console.log(`  ✅ Cleared: ${key}`);
      count++;
    }

    if (count === 0) {
      console.log("  📭 No collections found");
    }

    console.log(`\n🎉 Successfully wiped ${count} collections!`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
};

wipeDatabase();
