
import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    minWatchTime: {
        type: Number,
        default: 2, // Default 2 minutes
    },
    type: {
        type: String,
        enum: ['Video', 'Text'],
        default: 'Video',
    },
    videoUrl: {
        type: String, // YouTube Link
        // required: true, // Now optional based on type
    },
    textContent: {
        type: String, // For Text lessons
    },
    summary: {
        type: String, // Text summary
        required: true,
    },
    // Embedded Quiz
    quiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number, // Index of correct option
        }]
    },
    isFree: {
        type: Boolean,
        default: false, // For potentially paid courses later
    }
}, { timestamps: true });

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
