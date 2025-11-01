// models/Agent.js
import mongoose, { Schema } from "mongoose";

const agentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],  // ✅ Añadido
    unique: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],  // ✅ Añadido
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],  // ✅ Añadido
    min: [18, 'Age must be at least 18'],
    max: [130, 'Age cannot exceed 130'],
    index: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],  // ✅ Añadido
    index: true
  }
}, {
  timestamps: true  // ✅ Añade createdAt y updatedAt
});

export const Agent = mongoose.model('Agent', agentSchema);