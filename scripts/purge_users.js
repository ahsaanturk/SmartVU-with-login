
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ahssanturk:SmartU123.@cluster0.s2mh1ov.mongodb.net/';

async function purge() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Also clear session/task statuses related to users if needed, but User is the main one
        const UserTaskStatus = mongoose.models.UserTaskStatus || mongoose.model('UserTaskStatus', new mongoose.Schema({}, { strict: false }));

        const res = await User.deleteMany({});
        console.log(`Deleted ${res.deletedCount} users.`);

        const res2 = await UserTaskStatus.deleteMany({});
        console.log(`Deleted ${res2.deletedCount} task statuses.`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

purge();
