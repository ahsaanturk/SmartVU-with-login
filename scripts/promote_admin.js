
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read Env
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.trim();
    }
});

const MONGODB_URI = envConfig.MONGODB_URI;

async function promote() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Update verify target
        const targetEmail = 'ahsaanturk@gmail.com';
        const res = await User.updateOne(
            { email: targetEmail },
            { $set: { role: 'admin' } }
        );

        console.log(`Promoted ${targetEmail} to Admin. Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`);

        // Double check
        const user = await User.findOne({ email: targetEmail });
        console.log('User Role Now:', user?.role);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

promote();
