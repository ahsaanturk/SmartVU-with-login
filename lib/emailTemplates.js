
export const getNewTaskTemplate = (task, diffDays, diffHours) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;">
            <h2 style="color: #1cb0f6; text-align: center;">New Task Alert! 🚨</h2>
            <p style="text-align: center; font-size: 1.1rem;">A new <strong>${task.type}</strong> has been posted for <strong>${task.courseCode}</strong>.</p>
            
            <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
                <p style="margin: 0; color: #555; line-height: 1.5;">${task.description || 'No description provided.'}</p>
            </div>

            <div style="background: #e5f6fd; padding: 15px; border-radius: 8px; border: 1px solid #1cb0f6; color: #0077c2; font-weight: bold; text-align: center; font-size: 1.1rem;">
                ⏳ You have ${diffDays} day(s) and ${diffHours} hour(s) remaining!
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="background: #58cc02; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 0 #46a302;">
                    OPEN DASHBOARD
                </a>
            </div>

            <p style="margin-top: 20px; font-size: 0.8rem; color: #888; text-align: center;">
                SmartVU Learning Portal
            </p>
        </div>
    `;
};

export const get24HourReminderTemplate = (task) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffbd00; border-radius: 12px;">
            <h2 style="color: #ffbd00; text-align: center;">⏰ 24 Hours Remaining!</h2>
            <p style="text-align: center; font-size: 1.1rem;">The deadline for <strong>${task.courseCode} - ${task.title}</strong> is approaching.</p>
            
            <div style="background: #fffbe6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #ffbd00;">
                <p style="margin: 0; color: #333; font-weight: bold; text-align: center;">Due: ${new Date(task.dueDate).toLocaleString()}</p>
            </div>

            <p style="text-align: center; color: #555;">
                Don't lose your streak! Complete this task before it expires.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="background: #ffbd00; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 0 #d9a100;">
                    COMPLETE NOW
                </a>
            </div>
        </div>
    `;
};

export const get6HourUrgentTemplate = (task) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ff4b4b; border-radius: 12px; background-color: #fff5f5;">
            <h2 style="color: #ff4b4b; text-align: center; font-size: 1.8rem;">⚠️ URGENT: 6 Hours Left!</h2>
            <p style="text-align: center; font-size: 1.2rem; font-weight: bold;">Final Reminder for ${task.courseCode}</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ff4b4b;">
                <h3 style="margin: 0 0 10px 0; color: #333; text-align: center;">${task.title}</h3>
                <p style="margin: 0; color: #ff4b4b; font-weight: bold; text-align: center;">Expires in less than 6 hours!</p>
            </div>

            <p style="text-align: center; color: #333;">
                This is your last chance to submit. If you miss this, you will lose XP and your streak might be at risk.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="background: #ff4b4b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1.2rem; box-shadow: 0 4px 0 #cc0000; display: inline-block;">
                    RUSH TO TASKS
                </a>
            </div>
        </div>
    `;
};
