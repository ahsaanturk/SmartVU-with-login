
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Basic env parser
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
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
        }
    } catch (e) {
        // ignore
    }
}
loadEnv();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected. Searching for Admin users...");
        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) {
            console.log("CRITICAL: No Admin users found in the database!");
            console.log("Searching for ANY users...");
            const allUsers = await User.find({}).limit(5);
            allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
        } else {
            console.log(`Found ${admins.length} Admin(s):`);
            admins.forEach(a => console.log(`- ${a.name} (${a.email}) [${a.role}]`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
