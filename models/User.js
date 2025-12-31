
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
    },
    // Future WhatsApp Integration
    phoneNumber: {
        type: String,
    },
    otp: {
        code: {
            type: String,
        },
        expires: {
            type: Date,
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    // Student MVP Fields
    degree: {
        type: String,
        default: 'BSCS', // Can be updated in Settings
    },
    semester: {
        type: Number,
        default: 1,
    },
    selectedCourses: [{
        type: String, // Storing Course Codes or IDs
    }],
    plannedStudyTime: {
        type: Number,
        default: 120, // Minutes per day
    },
    streakDays: {
        type: Number,
        default: 0,
    },
    lastStudyDate: {
        type: Date,
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
