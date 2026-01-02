
import mongoose from 'mongoose';

const CourseGroupSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // References to students who are eligible for this course
    studentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    meta: {
        lastSync: { type: Date, default: Date.now },
        allowedProgramsSnapshot: [String],
        semesterSnapshot: Number
    }
}, { timestamps: true });

// Index for fast lookup of a student's groups
CourseGroupSchema.index({ studentIds: 1 });

export default mongoose.models.CourseGroup || mongoose.model('CourseGroup', CourseGroupSchema);
