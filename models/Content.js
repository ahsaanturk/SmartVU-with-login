
import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Concept', 'Quote', 'Lecture'],
        required: true,
    },
    title: {
        type: String, // e.g. "OOP Polymorphism" or "Quote"
    },
    description: {
        type: String, // The actual concept text or quote text
    },
    content: {
        type: String, // URL for Lecture, or extended text
    },
    author: {
        type: String, // For quotes
    },
    date: {
        type: Date, // For "Of the Day" logic
        default: Date.now,
    },
    courseCode: {
        type: String, // Optional, if linked to a course
    },
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
