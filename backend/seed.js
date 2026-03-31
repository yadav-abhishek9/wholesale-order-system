require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'admin',
      phone: '1234567890'
    });
    await admin.save();
    console.log('Admin user created');

    // Create salesman user
    const salesPassword = await bcrypt.hash('sales123', 10);
    const salesman = new User({
      name: 'Sales Person',
      email: 'sales@demo.com',
      password: salesPassword,
      role: 'salesman',
      phone: '0987654321'
    });
    await salesman.save();
    console.log('Salesman user created');

    console.log('\n✅ Demo users created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('👤 Admin: admin@demo.com / admin123');
    console.log('👤 Salesman: sales@demo.com / sales123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();