
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

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
                    process.env[match[1]] = (match[2] || '').replace(/^"|"$/g, '');
                }
            }
        }
    } catch (e) { }
}
loadEnv();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'testadmin@vu.edu.pk';
        const password = await bcrypt.hash('password123', 10);

        await User.findOneAndUpdate(
            { email },
            {
                name: 'Test Admin',
                email,
                password,
                role: 'admin',
                degree: 'BSCS',
                university: 'Virtual University'
            },
            { upsert: true, new: true }
        );

        console.log('Test Admin Created: testadmin@vu.edu.pk / password123');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
