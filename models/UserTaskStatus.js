
import mongoose from 'mongoose';

const UserTaskStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Missed'],
        default: 'Pending',
    },
    completionDate: {
        type: Date,
    },
}, { timestamps: true });

// Ensure unique combination so one user can't have duplicate status for same task
UserTaskStatusSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export default mongoose.models.UserTaskStatus || mongoose.model('UserTaskStatus', UserTaskStatusSchema);
