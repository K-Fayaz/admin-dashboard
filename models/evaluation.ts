import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
  promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },

  score: { type: Number, required: true },              // endScore (e.g. 2.6)
  summary: { type: String, required: true },            // high-level verdict
  
  sizeCompliance: {
    score: { type: Number, required: true },
    reasoning: { type: String, required: true },
    isOptimal: { type: Boolean,required: true}
  },
  
  brandCompliance: {
    score: { type: Number, required: true },
    styleAlignment: { type: Number, required: true },
    colorCompliance: { type: Number, required: true },
    voiceConsistency: { type: Number, required: true },
    visionAlignment: { type: Number, required: true },
    reasoning: { type: String, required: true },
    strengths: { type: String, required: true },
    improvements: { type: String, required: true }
  },
  
  createdAt: { type: Date, default: Date.now }
});

export const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);

