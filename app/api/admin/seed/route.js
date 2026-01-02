
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Program from '@/models/Program';
import Semester from '@/models/Semester';

/**
 * Admin Seed Route
 * Seeds the database with essential backbone data: Programs, Semesters, and Courses.
 * Access: Public (during setup) or Protected (via middleware).
 */
export async function POST() {
    try {
        await dbConnect();

        // ---------------------------------------------------------
        // 1. Seed Programs (Backbone)
        // ---------------------------------------------------------
        const programs = [
            { code: "BSCS", title: "Bachelor of Science in Computer Science", totalSemesters: 8 },
            { code: "BSIT", title: "Bachelor of Science in Information Technology", totalSemesters: 8 },
            { code: "BSSE", title: "Bachelor of Science in Software Engineering", totalSemesters: 8 }
        ];

        let programMap = {}; // Maps Program Code ("BSCS") -> ObjectId
        for (const p of programs) {
            const doc = await Program.findOneAndUpdate(
                { code: p.code },
                p,
                { upsert: true, new: true, runValidators: true }
            );
            programMap[p.code] = doc._id;
        }

        // ---------------------------------------------------------
        // 2. Seed Semesters (Backbone)
        // ---------------------------------------------------------
        const semesterData = {
            name: "Fall 2024",
            code: "FA24",
            startDate: new Date('2024-10-01'),
            endDate: new Date('2025-03-30'),
            isActive: true
        };

        const activeSem = await Semester.findOneAndUpdate(
            { code: semesterData.code },
            semesterData,
            { upsert: true, new: true, runValidators: true }
        );

        // ---------------------------------------------------------
        // 3. Seed Courses (Linked Content)
        // ---------------------------------------------------------
        const courses = [
            { code: "CS101", name: "Introduction to Computing", semester: 1, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 3 },
            { code: "CS201", name: "Introduction to Programming", semester: 2, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 3 },
            { code: "CS201P", name: "Introduction to Programming (Practical)", semester: 2, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 1 },
            { code: "MTH101", name: "Calculus and Analytical Geometry", semester: 1, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 3 },
            { code: "ENG101", name: "English Comprehension", semester: 1, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 3 },
            { code: "MTH202", name: "Discrete Mathematics", semester: 2, allowedPrograms: ["BSCS", "BSSE"], creditHours: 3 },
            { code: "PHY101", name: "Physics", semester: 1, allowedPrograms: ["BSCS", "BSSE"], creditHours: 3 },
            { code: "PAK301", name: "Pakistan Studies", semester: 1, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 2 },
            { code: "VU001", name: "Introduction to e-Learning", semester: 1, allowedPrograms: ["BSCS", "BSSE", "BSIT"], creditHours: 1 }
        ];

        let seedLog = [];
        for (const c of courses) {
            // Map legacy string codes to new ObjectIds
            const allowedIds = c.allowedPrograms
                .map(code => programMap[code])
                .filter(id => id); // Remove undefined if mapped code not found

            const res = await Course.findOneAndUpdate(
                { code: c.code },
                {
                    name: c.name,
                    semester: c.semester,
                    creditHours: c.creditHours,
                    description: `${c.name} (${c.code}) - Semester ${c.semester}`,

                    // Strict Eligibility
                    allowedPrograms: c.allowedPrograms, // Maintain for string queries if needed
                    allowedProgramIds: allowedIds,      // New ObjectId reference

                    // Context
                    activeSemesterId: activeSem._id,
                    status: 'active'
                },
                { upsert: true, new: true, runValidators: true }
            );
            seedLog.push(res.code);
        }

        return NextResponse.json({
            success: true,
            message: "Database Seeded Successfully",
            programs: Object.keys(programMap),
            semester: activeSem.code,
            coursesSeeded: seedLog.length,
            courses: seedLog
        });

    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
