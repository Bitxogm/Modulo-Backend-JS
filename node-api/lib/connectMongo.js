import { MongoClient } from 'mongodb';

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';

export const dbClient = new MongoClient(url);