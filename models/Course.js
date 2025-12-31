
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
    degree: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
