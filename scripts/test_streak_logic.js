
// const fetch = require('node-fetch'); // Native fetch in Node 18+
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
}

// Minimal Schemas
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    streakDays: { type: Number, default: 0 },
    lastStudyDate: Date,
    streakHistory: [Date],
    xp: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const CourseProgressSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    courseId: String,
    completedLessons: [String],
    lessonAttempts: { type: Map, of: new mongoose.Schema({ lastAttempt: Date, failedCount: Number }) }
});
const CourseProgress = mongoose.model('CourseProgress', CourseProgressSchema);

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // 1. Create Test User
    const testEmail = `streak_test_${Date.now()}@example.com`;
    const user = await User.create({
        name: 'Streak Tester',
        email: testEmail,
        streakDays: 0,
        streakHistory: [],
        xp: 0
    });
    console.log(`Created User: ${user._id}`);

    // 2. Generate Token
    const token = jwt.sign({ userId: user._id, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });
    const headers = { 'Cookie': `token=${token}`, 'Content-Type': 'application/json' };
    const baseUrl = 'http://localhost:3000';

    try {
        // 3. Test: Final Quiz Pass (Should Increment)
        console.log('\n--- Test 1: Final Quiz Pass ---');
        const res1 = await fetch(`${baseUrl}/api/lessons/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lessonId: 'test_lesson_1',
                courseId: 'test_course_1',
                quizCorrect: true
            })
        });
        const data1 = await res1.json();
        console.log('Response:', data1);
        if (data1.streakUpdated && data1.newStreak === 1) {
            console.log('✅ PASS: Streak incremented to 1');
        } else {
            console.error('❌ FAIL: Streak did not increment correctly');
        }

        // 4. Test: Same Day Repeat (Should NOT Increment)
        console.log('\n--- Test 2: Idempotency (Same Day) ---');
        const res2 = await fetch(`${baseUrl}/api/lessons/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lessonId: 'test_lesson_2',
                courseId: 'test_course_1',
                quizCorrect: true
            })
        });
        const data2 = await res2.json();
        console.log('Response:', data2); // should be streakUpdated: false
        if (!data2.streakUpdated && data2.newStreak === 1) { // API returns current streak
            console.log('✅ PASS: Streak stayed at 1');
        } else {
            // My API implementation returns `newStreak: user.streakDays`
            // If streakUpdated is false, it means it didn't change logic, but the value returned is current.
            console.error('❌ FAIL: Streak changed unexpected or flag wrong');
        }

        // 5. Check Progress API for history
        console.log('\n--- Test 3: Check History via /api/me ---');
        // Actually /api/me is what we updated to return history implicitly
        const res3 = await fetch(`${baseUrl}/api/me`, { headers });
        const data3 = await res3.json();
        console.log('User Data:', JSON.stringify(data3.user.streakHistory));
        if (data3.user.streakHistory && data3.user.streakHistory.length === 1) {
            console.log('✅ PASS: History has 1 entry');
        } else {
            console.error('❌ FAIL: History incorrect');
        }

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await User.findByIdAndDelete(user._id);
        await CourseProgress.deleteMany({ userId: user._id });
        await mongoose.disconnect();
        console.log('Cleanup done');
    }
}

run();
