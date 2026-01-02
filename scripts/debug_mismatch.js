
const mongoose = require('mongoose');

// Schemas (Minimal for reading)
const UserSchema = new mongoose.Schema({}, { strict: false });
const CourseSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartvu');
        console.log("Connected to DB.");

        // 1. Fetch User (Nehmat Ullah Khan) - searching by name regex to be safe
        const user = await User.findOne({ name: /Nehmat/i });
        if (!user) {
            console.log("❌ User 'Nehmat' not found!");
        } else {
            console.log("✅ User Found:");
            console.log(`   ID: ${user._id}`);
            console.log(`   Name: "${user.name}"`);
            console.log(`   Degree: "${user.degree}" (Type: ${typeof user.degree})`);
            console.log(`   Semester: ${user.semester} (Type: ${typeof user.semester})`);
        }

        // 2. Fetch Course (CS101)
        const course = await Course.findOne({ code: "CS101" });
        if (!course) {
            console.log("❌ Course 'CS101' not found!");
        } else {
            console.log("✅ Course Found:");
            console.log(`   Code: "${course.code}"`);
            console.log(`   Title: "${course.title || course.name}"`); // Handle potential schema mismatch
            console.log(`   Semester: ${course.semester} (Type: ${typeof course.semester})`);
            console.log(`   AllowedPrograms: ${JSON.stringify(course.allowedPrograms)}`);
            if (Array.isArray(course.allowedPrograms)) {
                course.allowedPrograms.forEach(p => {
                    console.log(`      - "${p}" (Type: ${typeof p})`);
                });
            }
        }

        // 3. Simulation
        if (user && course) {
            console.log("\n🔍 Simulation:");
            const degreeMatch = course.allowedPrograms.includes(user.degree);
            const semesterMatch = course.semester == user.semester; // Loose equality check
            const strictSemesterMatch = course.semester === user.semester;

            console.log(`   Degree Match ("${user.degree}" in allowed): ${degreeMatch}`);
            console.log(`   Semester Match (Loose: ${user.semester} == ${course.semester}): ${semesterMatch}`);
            console.log(`   Semester Match (Strict: ${user.semester} === ${course.semester}): ${strictSemesterMatch}`);
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
