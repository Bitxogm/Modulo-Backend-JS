// lib/connectMongo.js
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

let db;
let client;

export const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const url = new URL(MONGO_URI);
    const dbName = url.pathname.slice(1) || 'nodeapi';
    
    db = client.db(dbName);
    
    console.log(`✅ MongoDB Connected`);
    console.log(`📦 Database: ${db.databaseName}`);
    console.log(`🔗 Host: ${url.host}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('❌ Database not initialized. Call connectDB() first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('👋 MongoDB connection closed');
    db = null;
    client = null;
  }
};

// Cerrar conexión cuando la app se cierra
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
