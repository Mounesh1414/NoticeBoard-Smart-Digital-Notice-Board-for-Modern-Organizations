import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice', required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, default: 'notice' },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
