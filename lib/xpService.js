import User from '@/models/User';

/**
 * Adds XP to a user, updating both their total XP and their daily history.
 * Handles creating a new daily entry if one doesn't exist for today (UTC).
 * 
 * @param {string} userId - The ID of the user
 * @param {number} amount - Amount of XP to add
 */
export async function addXP(userId, amount) {
    if (!amount || amount <= 0) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to UTC Midnight

    // Try to increment existing daily entry
    const updateResult = await User.updateOne(
        {
            _id: userId,
            'dailyXP.date': today
        },
        {
            $inc: {
                'dailyXP.$.xp': amount,
                xp: amount,
                weeklyXP: amount // Legacy field - keeping kept in sync for safety
            }
        }
    );

    // If no entry matched (matchedCount === 0), it means either:
    // 1. User doesn't exist (handled by next call failing silently or throwing)
    // 2. User exists but doesn't have an entry for today.
    if (updateResult.matchedCount === 0) {
        // Push new entry
        await User.findByIdAndUpdate(userId, {
            $inc: { xp: amount, weeklyXP: amount },
            $push: {
                dailyXP: {
                    date: today,
                    xp: amount
                }
            }
        });
    }
}
