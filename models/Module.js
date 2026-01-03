
import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    order: {
        type: Number,
        default: 0,
    },
    unitQuiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }]
    },
    preAssessment: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number // Index
        }],
        passingPercentage: {
            type: Number,
            default: 60
        }
    }
}, { timestamps: true });

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);
