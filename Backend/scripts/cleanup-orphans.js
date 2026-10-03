// 🧹 একবার চালানোর স্ক্রিপ্ট: পুরোনো ভাঙা ডাটা পরিষ্কার
// - যে ট্রিপ আর নেই বা কনফার্ম হয়ে গেছে, তার "pending" আবেদনগুলো → rejected
// - মুছে ফেলা ড্রাইভারের pending আবেদন → মুছে ফেলা
// চালাতে: MONGO_URI সহ `npm run cleanup` (Render এর Shell থেকেও চালানো যায়)
require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const TripApplication = require('../models/TripApplication');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const pendingTripIds = (await Trip.find({ status: 'pending' }).select('_id')).map((t) => t._id);
  const orphan = await TripApplication.updateMany(
    { status: 'pending', tripId: { $nin: pendingTripIds } },
    { status: 'rejected' }
  );

  const driverIds = (await Driver.find().select('_id')).map((d) => d._id);
  const ghost = await TripApplication.deleteMany({ status: 'pending', driverId: { $nin: driverIds } });

  console.log(`✅ ${orphan.modifiedCount}টি পুরোনো আবেদন rejected, ${ghost.deletedCount}টি মুছে ফেলা ড্রাইভারের আবেদন মোছা হলো`);
  await mongoose.disconnect();
})().catch((error) => {
  console.error('❌', error.message);
  process.exit(1);
});
