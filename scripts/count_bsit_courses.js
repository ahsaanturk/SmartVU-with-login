
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Basic env parser since dotenv is not installed
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                // simple parsing
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                        value = value.replace(/^"|"$/g, '');
                    }
                    process.env[key] = value;
                }
            }
        } else {
            console.log('No .env.local found');
        }
    } catch (e) {
        console.error('Failed to load .env.local', e.message);
    }
}

loadEnv();

// Define minimal schema for query
const CourseSchema = new mongoose.Schema({
    name: String,
    code: String,
    semester: Number,
    allowedPrograms: [String],
    status: String,
    creditHours: Number
}, { strict: false });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function run() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // DEBUG: List all courses to see what we have
        const allCourses = await Course.find({});
        const debugFile = path.join(__dirname, 'debug_courses.txt');
        let debugOutput = `DEBUG: Found ${allCourses.length} TOTAL courses in DB.\n`;

        allCourses.forEach(c => {
            debugOutput += `- "${c.name}" | Code: "${c.code}" | Sem: ${c.semester} | Programs: ${JSON.stringify(c.allowedPrograms)} | Status: ${c.status}\n`;
        });

        fs.writeFileSync(debugFile, debugOutput);
        console.log('Debug info written to debug_courses.txt');

        // Query: Semester 1 AND Allowed Program "BSIT"
        const query = {
            semester: 1,
            allowedPrograms: 'BSIT',
            status: 'active'
        };

        const count = await Course.countDocuments(query);
        const courses = await Course.find(query).select('code name creditHours');

        console.log(`\n================================`);
        console.log(`TOTAL COURSES FOR BSIT (SEM 1): ${count}`);
        console.log(`================================\n`);

        if (count > 0) {
            courses.forEach(c => {
                console.log(`- [${c.code}] ${c.name} (${c.creditHours} Cr)`);
            });
        } else {
            console.log('No courses found.');
        }
        console.log(`\n================================`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

run();
