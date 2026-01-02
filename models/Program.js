
import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // "BSCS", "BSIT"
        trim: true
    },
    title: {
        type: String, // "Bachelor of Science in Computer Science"
        required: true,
    },
    totalSemesters: {
        type: Number,
        required: true, // e.g. 8 for BS, 4 for MS
    },
    department: {
        type: String, // "Computer Science"
    }
}, { timestamps: true });

export default mongoose.models.Program || mongoose.model('Program', ProgramSchema);
