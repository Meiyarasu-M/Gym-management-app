const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Member = require('../models/Member');

// Create mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Build styled HTML email template
const buildReminderEmail = (member) => {
  const expiryDate = new Date(member.subscriptionEnd).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Subscription Expiry Reminder</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .icon { font-size: 48px; margin-bottom: 10px; }
    .body { padding: 36px 32px; color: #cbd5e1; }
    .greeting { font-size: 20px; color: #f1f5f9; font-weight: 600; margin-bottom: 16px; }
    .message { line-height: 1.7; font-size: 15px; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; }
    .card-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-size: 13px; font-weight: 500; }
    .value { color: #f1f5f9; font-size: 14px; font-weight: 600; }
    .expiry-value { color: #f59e0b; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 600; display: inline-block; letter-spacing: 0.5px; }
    .footer { background: #0f172a; padding: 20px 32px; text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; }
    .footer strong { color: #6366f1; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="icon">🏋️</div>
      <h1>GymPro Management</h1>
      <p>Subscription Renewal Reminder</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${member.name}! 👋</p>
      <p class="message">
        We hope you've been crushing your fitness goals! 💪 This is a friendly reminder that your
        <strong>GymPro membership</strong> is expiring soon. Don't let your momentum stop — renew now and keep going!
      </p>
      <div class="card">
        <div class="card-row">
          <span class="label">Member Name</span>
          <span class="value">${member.name}</span>
        </div>
        <div class="card-row">
          <span class="label">Email</span>
          <span class="value">${member.email}</span>
        </div>
        <div class="card-row">
          <span class="label">Plan Type</span>
          <span class="value">${member.planType}</span>
        </div>
        <div class="card-row">
          <span class="label">Expiry Date</span>
          <span class="value expiry-value">⚠️ ${expiryDate}</span>
        </div>
      </div>
      <p class="message">
        Please visit the gym or contact us to renew your membership and avoid any interruption in your access.
      </p>
      <div class="cta">
        <a href="mailto:${process.env.EMAIL_USER}?subject=Membership Renewal - ${member.name}">
          Renew My Membership →
        </a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated reminder from <strong>GymPro Management System</strong>.</p>
      <p>If you've already renewed, please ignore this email. Thank you! 🙏</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send reminder email
const sendReminderEmail = async (member) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `GymPro <${process.env.EMAIL_USER}>`,
      to: member.email,
      subject: `⚠️ Your GymPro Membership Expires in 3 Days, ${member.name}!`,
      html: buildReminderEmail(member),
    });
    console.log(`📧 Reminder sent to ${member.email} — Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${member.email}:`, error.message);
  }
};

// Cron job: runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running subscription expiry cron job...');

  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Find members expiring in next 3 days
    const expiringMembers = await Member.find({
      status: 'Active',
      subscriptionEnd: {
        $gte: today,
        $lte: threeDaysLater,
      },
    });

    console.log(`📋 Found ${expiringMembers.length} member(s) with expiring subscriptions`);

    for (const member of expiringMembers) {
      await sendReminderEmail(member);
    }

    // Auto-deactivate expired members
    const expired = await Member.updateMany(
      { status: 'Active', subscriptionEnd: { $lt: new Date() } },
      { $set: { status: 'Inactive' } }
    );

    if (expired.modifiedCount > 0) {
      console.log(`🔄 Auto-deactivated ${expired.modifiedCount} expired member(s)`);
    }
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
  }
});

console.log('✅ Subscription reminder cron job scheduled (daily at 8:00 AM)');
