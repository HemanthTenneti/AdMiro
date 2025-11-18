import mongoose from "mongoose";

// Clean up old indexes that may cause conflicts
const cleanupOldIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collection = db.collection("displayconnectionrequests");
    const indexes = await collection.getIndexes();

    // Drop old nested index if it exists
    if (indexes["displayInfo.macAddress_1"]) {
      console.log("🧹 Cleaning up old index: displayInfo.macAddress_1");
      await collection.dropIndex("displayInfo.macAddress_1");
      console.log("✅ Removed legacy index: displayInfo.macAddress_1");
    }
  } catch (error) {
    // Silently ignore if collection doesn't exist or index not found
    if (
      !error.message.includes("ns does not exist") &&
      !error.message.includes("index not found")
    ) {
      console.warn("⚠️ Index cleanup warning:", error.message);
    }
  }
};

const connectDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      // Connection timeout settings
      serverSelectionTimeoutMS: 20000, // 20 seconds to select a server
      socketTimeoutMS: 60000, // 60 seconds socket timeout

      // Retry settings
      retryWrites: true,
      w: "majority",

      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection State: ${conn.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error(
      `❌ Error connecting to MongoDB (Attempt ${retryCount + 1}/${
        maxRetries + 1
      }): ${error.message}`
    );

    // Retry logic
    if (retryCount < maxRetries) {
      const delayMs = Math.min(1000 * Math.pow(2, retryCount), 15000); // Exponential backoff, max 15s
      console.log(`⏳ Retrying in ${delayMs}ms...`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      return connectDB(retryCount + 1, maxRetries);
    } else {
      console.error("🔴 Failed to connect to MongoDB after maximum retries");
      console.error("Full error:", error);
      console.error("\n📝 Troubleshooting steps:");
      console.error("1. Check MongoDB Atlas Network Access includes 0.0.0.0/0");
      console.error("2. Verify DATABASE_URL in .env is correct");
      console.error("3. Check your internet connection");
      console.error("4. Try restarting the server");
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
  // Clean up old indexes after connection
  cleanupOldIndexes();
});

mongoose.connection.on("error", err => {
  console.error("❌ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  Mongoose disconnected from MongoDB");
});

export default connectDB;
