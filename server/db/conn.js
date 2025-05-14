const fs = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

let uri;

// 1. Try to load from Docker secret file if the path is provided
if (process.env.MONGO_SECRET_PATH) {
  try {
    uri = fs.readFileSync(process.env.MONGO_SECRET_PATH, "utf8").trim();
    console.log("🔐 Loaded MongoDB URI from Docker secret.");
  } catch (err) {
    console.error("❌ Failed to read Docker secret file:", err.message);
    process.exit(1);
  }
} else if (process.env.MONGO_URI) {
  // 2. Fallback to .env URI in development
  uri = process.env.MONGO_URI.trim();
  console.log("📦 Loaded MongoDB URI from .env");
} else {
  // 3. No connection string found
  console.error("❌ No MongoDB URI provided in either .env or Docker secret.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let _db;

module.exports = {
  connectToMongoDB: async function (callback) {
    try {
      await client.connect();
      _db = client.db("employees");
      console.log("✅ Connected to MongoDB.");
      return callback(null);
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      return callback(error);
    }
  },

  getDb: function () {
    if (!_db) {
      throw new Error("Database not initialized. Call connectToMongoDB first.");
    }
    return _db;
  },
};
