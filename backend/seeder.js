const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Member = require('./models/Member');
const Payment = require('./models/Payment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Member.deleteMany({});
    await Payment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gympro.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@gympro.com / admin123');

    // Create sample members
    const now = new Date();
    const members = await Member.insertMany([
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        planType: 'Monthly',
        status: 'Active',
        subscriptionStart: new Date(now.getFullYear(), now.getMonth(), 1),
        subscriptionEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        planType: 'Yearly',
        status: 'Active',
        subscriptionStart: new Date(now.getFullYear(), 0, 1),
        subscriptionEnd: new Date(now.getFullYear() + 1, 0, 1),
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '9876543212',
        planType: 'Quarterly',
        status: 'Active',
        subscriptionStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        subscriptionEnd: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        phone: '9876543213',
        planType: 'Monthly',
        status: 'Inactive',
        subscriptionStart: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        subscriptionEnd: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '9876543214',
        planType: 'Yearly',
        status: 'Active',
        subscriptionStart: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        subscriptionEnd: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        name: 'Anjali Mehta',
        email: 'anjali@example.com',
        phone: '9876543215',
        planType: 'Monthly',
        status: 'Active',
        subscriptionStart: new Date(now.getFullYear(), now.getMonth(), 5),
        subscriptionEnd: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      },
    ]);
    console.log(`👥 Created ${members.length} sample members`);

    // Create a member User account for Rahul so member login can be tested
    await User.create({
      name: members[0].name,
      email: members[0].email,
      password: 'member123',
      role: 'member',
      memberId: members[0]._id,
    });
    console.log(`🔐 Member account created: ${members[0].email} / member123`);

    // Create sample payments (last 6 months)
    const paymentMethods = ['Cash', 'Card', 'Online', 'UPI'];
    const planAmounts = { Monthly: 1500, Quarterly: 4000, Yearly: 14000 };
    const payments = [];

    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 15);
      const monthMembers = members.slice(0, 4);
      for (const member of monthMembers) {
        payments.push({
          member: member._id,
          amount: planAmounts[member.planType] || 1500,
          date: monthDate,
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          planType: member.planType,
          status: 'Completed',
        });
      }
    }

    await Payment.insertMany(payments);
    console.log(`💳 Created ${payments.length} sample payments`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n── Admin ─────────────────────────────');
    console.log('📧 Email   : admin@gympro.com');
    console.log('🔑 Password: admin123');
    console.log('\n── Member ────────────────────────────');
    console.log('📧 Email   : rahul@example.com');
    console.log('🔑 Password: member123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
