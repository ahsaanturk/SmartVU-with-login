
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
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    // Student MVP Fields
    university: {
        type: String,
        default: 'Virtual University',
    },
    degreeLevel: {
        type: String,
        default: 'BS',
    },
    degree: {
        type: String,
        enum: ['BSCS', 'BSIT', 'BSSE'],
        default: 'BSCS',
    },
    semester: {
        type: Number,
        min: 1,
        max: 8,
        default: 1,
    },
    selectedCourses: [{
        type: String, // Legacy Storing Course Codes
    }],
    // New Architecture Fields
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
    },
    enrolledSemesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
    },
    selectedCourseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    currentSemesterLevel: {
        type: Number,
        default: 1,
    },
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
    streakHistory: [{
        type: Date // Tracks exact dates of streak activity
    }],
    dailyXP: [{
        date: {
            type: Date
        },
        xp: {
            type: Number,
            default: 0
        }
    }],
    xp: {
        type: Number,
        default: 0
    },
    weeklyXP: {
        type: Number,
        default: 0
    },
    lastWeeklyReset: {
        type: Date,
        default: Date.now
    },
    lastPromotionDate: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
