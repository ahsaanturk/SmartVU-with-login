
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true, // e.g., CS101
    },
    semester: {
        type: Number,
        required: true,
    },
    creditHours: {
        type: Number,
        required: true,
        default: 3,
    },
    allowedPrograms: [{
        type: String, // Legacy Support
        required: true
    }],
    allowedProgramIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }],
    activeSemesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester'
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
