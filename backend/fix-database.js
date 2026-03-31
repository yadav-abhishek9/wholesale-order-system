// fix-database.js - Automated Database Fix
require('dotenv').config();
const mongoose = require('mongoose');

const fixDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the users collection entirely to remove all indexes
    console.log('\nDropping users collection...');
    await mongoose.connection.db.collection('users').drop().catch(() => {
      console.log('Collection does not exist, creating new...');
    });
    console.log('✅ Users collection dropped');

    console.log('\n✅ Database fixed! Now run: npm run seed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    process.exit(1);
  }
};

fixDatabase();