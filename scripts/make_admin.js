
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = (match[2] || '').replace(/^"|"$/g, '');
                }
            }
        }
    } catch (e) { }
}
loadEnv();

const UserSchema = new mongoose.Schema({ email: String, role: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
        await mongoose.connect(process.env.MONGODB_URI);

        const emailToPromote = 'ghazi@vu.edu.pk'; // Targeting the likely main user

        console.log(`Promoting ${emailToPromote} to Admin...`);
        const res = await User.updateOne({ email: emailToPromote }, { $set: { role: 'admin' } });

        if (res.matchedCount > 0) {
            console.log(`SUCCESS: ${emailToPromote} is now an ADMIN.`);
            console.log("Please Log Out and Log In again to refresh your token!");
        } else {
            console.log(`User ${emailToPromote} not found. Trying '1@a'...`);
            // Fallback for the other user seen in logs
            const res2 = await User.updateOne({ email: '1@a' }, { $set: { role: 'admin' } });
            if (res2.matchedCount > 0) {
                console.log(`SUCCESS: '1@a' is now an ADMIN.`);
            } else {
                console.log("Failed to find any user to promote.");
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
