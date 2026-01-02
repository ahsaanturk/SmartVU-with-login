
import mongoose from 'mongoose';

const CourseProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    // Array of completed lesson IDs
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    // Explicitly unlocked modules (e.g. via Test Out)
    unlockedModules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    // Track failed attempts for "lockout" logic
    lessonAttempts: {
        type: Map,
        of: {
            lastAttempt: Date,
            failedCount: Number
        }
    },
    // Current active lesson (optional, for resume)
    currentLessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }
}, { timestamps: true });

// Ensure unique progress per user per course
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.CourseProgress || mongoose.model('CourseProgress', CourseProgressSchema);
