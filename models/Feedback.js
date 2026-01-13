import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['General', 'Bug', 'Feature Request'],
        default: 'General'
    },
    status: {
        type: String,
        enum: ['New', 'Reviewed', 'Resolved'],
        default: 'New'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
