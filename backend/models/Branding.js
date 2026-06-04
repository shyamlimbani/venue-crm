import mongoose from 'mongoose';

const brandingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "Venue CRM" },
    tagline: { type: String, default: "Enterprise Edition" },
    logo: { type: String, default: "" }, // Base64 or URL
    favicon: { type: String, default: "" }, // Base64 or URL
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Branding', brandingSchema);
