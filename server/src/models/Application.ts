import mongoose, { Document, Schema } from 'mongoose';

export type AppStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: AppStatus;
  salaryRange?: string;
  skills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[];
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    jdLink: String,
    notes: String,
    dateApplied: { type: Date, default: Date.now },
    status: { type: String, enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
    salaryRange: String,
    skills: [String],
    niceToHaveSkills: [String],
    seniority: String,
    location: String,
    resumeSuggestions: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', applicationSchema);
