const dns = require('dns');
const mongoose = require('mongoose');

// DNS resolver setup for MongoDB Atlas SRV
dns.setServers(['1.1.1.1', '8.8.8.8']);

const dbConnection = () => {
  return mongoose
    .connect(process.env.MONGO_URI, {
      dbName: 'DESH_TRANSPORT', // আপনার প্রজেক্টের সাথে সামঞ্জস্য রেখে পরিবর্তন করা হয়েছে
    })
    .then(() => {
      console.log('✅ Connected to database successfully!');
    })
    .catch((err) => {
      console.log(`❌ Some error occurred while connecting to database! ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;