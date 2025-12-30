import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);