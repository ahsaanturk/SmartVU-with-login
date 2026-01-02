
import CourseGroup from '@/models/CourseGroup';
import Course from '@/models/Course';
import User from '@/models/User';
import dbConnect from '@/lib/db';

/**
 * Syncs a specific CourseGroup.
 * Call this when a Course is Created or Updated.
 */
export async function syncCourseGroup(courseId) {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) return; // or throw

    // 1. Find all eligible students
    // Rule: Student Degree in Course.allowedPrograms AND Student Semester == Course.Semester
    const eligibleStudents = await User.find({
        degree: { $in: course.allowedPrograms },
        semester: course.semester,
        role: 'student' // Safety: only target students
    }).select('_id');

    const studentIds = eligibleStudents.map(u => u._id);

    // 2. Upsert CourseGroup
    await CourseGroup.findOneAndUpdate(
        { courseCode: course.code },
        {
            courseId: course._id,
            courseCode: course.code,
            studentIds: studentIds,
            meta: {
                lastSync: new Date(),
                allowedProgramsSnapshot: course.allowedPrograms,
                semesterSnapshot: course.semester
            }
        },
        { upsert: true, new: true }
    );

    console.log(`[GroupService] Synced Group ${course.code}: ${studentIds.length} members.`);
}

/**
 * Syncs a specific Student across ALL CourseGroups.
 * Call this when a Student Registers or Updates Profile.
 */
export async function syncStudentGroups(userId) {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') return;

    // 1. Find all courses eligible for this student
    const eligibleCourses = await Course.find({
        allowedPrograms: user.degree,
        semester: user.semester
    });

    const eligibleCourseCodes = eligibleCourses.map(c => c.code);

    // 2. Add student to matching groups
    if (eligibleCourseCodes.length > 0) {
        await CourseGroup.updateMany(
            { courseCode: { $in: eligibleCourseCodes } },
            { $addToSet: { studentIds: user._id } }
        );
    }

    // 3. Remove student from groups they no longer qualify for (Cleanup)
    // i.e., Groups where courseCode is NOT in eligibleCourseCodes BUT studentId IS present
    await CourseGroup.updateMany(
        {
            courseCode: { $nin: eligibleCourseCodes },
            studentIds: user._id
        },
        { $pull: { studentIds: user._id } }
    );

    console.log(`[GroupService] Synced Student ${user.name} (${user.degree}-Sem${user.semester})`);
}
