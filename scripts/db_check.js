
const mongoose = require('mongoose');

// Define Schema minimal for reading
const CourseSchema = new mongoose.Schema({
    code: String,
    semester: Number,
    allowedPrograms: [String],
    degree: [String]
});
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartvu');
        console.log("Connected. Fetching courses...");
        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses.`);
        courses.forEach(c => {
            console.log(`- ${c.code} (Sem ${c.semester}): Allowed=${JSON.stringify(c.allowedPrograms)}, Degree=${JSON.stringify(c.degree)}`);
        });
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
