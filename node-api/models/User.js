import { Schema, model } from "mongoose";
import {hash} from 'bcrypt'

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

userSchema.statics.hashPassword = (clearPassword) => {
  password = hash(clearPassword, 7);
}

export const User = model('User', userSchema);

