
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const CourseSchema = new mongoose.Schema({}, { strict: false });
        const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

        console.log("Testing Queries for BSIT Sem 1...");

        // Test 1: String
        console.log("Querying with semester as String '1'...");
        const res1 = await Course.find({ allowedPrograms: "BSIT", semester: "1" });
        console.log(`Found: ${res1.length}`);

        // Test 2: Number
        console.log("Querying with semester as Number 1...");
        const res2 = await Course.find({ allowedPrograms: "BSIT", semester: 1 });
        console.log(`Found: ${res2.length}`);

        process.exit();
    } catch (e) { console.error(e); process.exit(1); }
}
run();
