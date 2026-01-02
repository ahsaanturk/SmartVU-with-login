
const mongoose = require('mongoose');

async function run() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("Please set MONGODB_URI");

        await mongoose.connect(uri);
        console.log("Connected to DB.");

        // Use a Loose Schema so we can see 'degree' even if it's not in strict schema
        const LooseCourseSchema = new mongoose.Schema({}, { strict: false });
        const Course = mongoose.models.Course || mongoose.model('Course', LooseCourseSchema);

        const allCourses = await Course.find({});
        console.log(`Found ${allCourses.length} courses.`);

        for (const c of allCourses) {
            let changed = false;

            // 1. Fix Title if missing
            if (!c.title && c.name) {
                console.log(`[${c.code}] fixing title...`);
                c.title = c.name;
                changed = true;
            }

            // 2. Fix allowedPrograms if empty but degree exists
            if ((!c.allowedPrograms || c.allowedPrograms.length === 0) && c.degree && Array.isArray(c.degree)) {
                console.log(`[${c.code}] migrating degree -> allowedPrograms...`);
                c.allowedPrograms = c.degree;
                changed = true;
            } else if (!c.allowedPrograms) {
                // If totally missing, set default?
                console.log(`[${c.code}] WARNING: No allowedPrograms or degree found.`);
            }

            // 3. Ensure allowedPrograms is non-empty for future safety?
            // If it's still empty, we can't really fix it automatically without knowing rules.

            // 4. Remove 'degree' field to clean up
            if (c.degree) {
                console.log(`[${c.code}] reducing legacy 'degree' field...`);
                c.degree = undefined;
                changed = true;
            }

            if (changed) {
                // We use replaceOne or updateOne to bypass strict validation issues mixed with our loose schema
                await Course.collection.updateOne(
                    { _id: c._id },
                    {
                        $set: {
                            title: c.title,
                            allowedPrograms: c.allowedPrograms,
                            creditHours: c.creditHours || 3
                        },
                        $unset: { degree: "", name: "" }
                    }
                );
                console.log(`[${c.code}] Updated.`);
            }
        }

        console.log("Migration Complete.");
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
