
import mongoose from 'mongoose';

const SemesterSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // "FA24", "SP25"
        trim: true
    },
    name: {
        type: String, // "Fall 2024"
        required: true,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false, // Only one should be active ideally
    }
}, { timestamps: true });

export default mongoose.models.Semester || mongoose.model('Semester', SemesterSchema);
