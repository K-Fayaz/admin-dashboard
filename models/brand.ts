import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
    brandId: { type: String, required: true, unique: true },
    brandName: { type: String, required: true },
    brandDescription: String,
    style: String,
    brandVision: String,
    brandVoice: String,
    colors: String,
  });
  
  export const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);