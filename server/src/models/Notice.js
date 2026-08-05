import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    department: String,
    priority: { type: String, default: 'normal' },
    attachments: [attachmentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishDate: Date,
    expiryDate: Date,
    status: { type: String, default: 'draft' },
    isPinned: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
