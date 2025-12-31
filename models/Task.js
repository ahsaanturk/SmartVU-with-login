
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true, // Links to Course.code
    },
    type: {
        type: String,
        enum: ['Quiz', 'Assignment', 'GDB'],
        required: true,
    },
    title: {
        type: String,
        required: true, // e.g. "Quiz 1"
    },
    description: {
        type: String,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: String, // e.g. "90 mins" for Assignments logic or just info
    },
    createdBy: {
        type: String,
        default: 'Admin',
    },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
