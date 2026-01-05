
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Manual Env Load
const envPath = path.resolve(process.cwd(), '.env.local');
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) {
        MONGODB_URI = match[1].trim().replace(/^["']|["']$/g, ''); // Unquote
    }
}

if (!MONGODB_URI) {
    console.error('No MONGODB_URI found');
    process.exit(1);
}

// Minimal Schema to avoid import issues
const UserSchema = new mongoose.Schema({
    dailyXP: [{
        date: { type: Date },
        xp: { type: Number, default: 0 }
    }],
    xp: Number,
    weeklyXP: Number,
    name: String
}, { strict: false }); // strict: false allows us to not define all fields

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function migrateXP() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let modified = 0;

        for (const user of users) {
            // Logic:
            // If user has old weeklyXP but NO dailyXP history,
            // we treat that weeklyXP as "earned today" to seed the rolling window.
            const hasDaily = user.dailyXP && user.dailyXP.length > 0;
            const hasLegacyWeekly = user.weeklyXP && user.weeklyXP > 0;

            if (!hasDaily && hasLegacyWeekly) {
                console.log(`Migrating ${user.name}: +${user.weeklyXP} XP to Today`);

                // Direct update to ensure array structure
                await User.updateOne(
                    { _id: user._id },
                    {
                        $push: {
                            dailyXP: {
                                date: today,
                                xp: user.weeklyXP
                            }
                        }
                    }
                );

                modified++;
            }
        }

        console.log(`Migration complete. Updated ${modified} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateXP();
