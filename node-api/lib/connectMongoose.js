import mongoose, { connect } from 'mongoose';

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';

export function connectMongoose() {
  return connect(url)
    .then(mongoose => mongoose.connection);
}