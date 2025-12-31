import mongoose from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true, enum: Object.values(UserRole), default: UserRole.USER },
  password: { type: String, required: false },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);