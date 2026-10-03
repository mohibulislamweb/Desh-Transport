const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const Driver = require('../models/Driver');
const TripHistory = require('../models/TripHistory');
const TripApplication = require('../models/TripApplication');

const { requireAdmin, requireDriver } = require('../middleware/authenticate');
const { rateLimit } = require('../middleware/rateLimit');
const {
  isValidBangladeshiPhone,
  normalizePhone,
  phoneFilter,
  safeDriver,
  signToken
} = require('../utils/auth');
const { normalizeLocation } = require('../utils/location');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// =======================
// Driver Registration
// =======================
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const {
      driverName,
      password,
      truckType,
      vehicleBody
    } = req.body;

    const phone = normalizePhone(req.body.phone);
    const truckCapacity = Number(req.body.truckCapacity);

    // 🛡️ ইনপুট যাচাই
    if (typeof driverName !== 'string' || !driverName.trim()) {
      return res.status(400).json({ message: 'ড্রাইভারের নাম দিন' });
    }
    if (!isValidBangladeshiPhone(phone)) {
      return res.status(400).json({ message: 'সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }
    if (typeof truckType !== 'string' || !truckType.trim()) {
      return res.status(400).json({ message: 'গাড়ির ধরন দিন' });
    }
    if (!Number.isFinite(truckCapacity) || truckCapacity <= 0) {
      return res.status(400).json({ message: 'গাড়ির ধারণক্ষমতা (টন) সঠিকভাবে দিন' });
    }
    if (!['covered', 'open'].includes(vehicleBody)) {
      return res.status(400).json({ message: 'গাড়ির বডি টাইপ বেছে নিন' });
    }

    const exists = await Driver.findOne({ phone: phoneFilter(phone) });

    if (exists) {
      return res.status(400).json({
        message: 'এই মোবাইল নাম্বার দিয়ে আগে রেজিস্ট্রেশন করা হয়েছে'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      driverName: driverName.trim(),
      phone,
      passwordHash,
      truckType: truckType.trim(),
      truckCapacity,
      vehicleBody
    });

    res.status(201).json({
      message: 'রেজিস্ট্রেশন সফল হয়েছে',
      driverId: driver._id
    });
  } catch (error) {
    // একই নাম্বারে একসাথে দুবার সাইনআপ
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'এই মোবাইল নাম্বার দিয়ে আগে রেজিস্ট্রেশন করা হয়েছে'
      });
    }
    next(error);
  }
});

// =======================
// Driver Login
// =======================
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (typeof phone !== 'string' || typeof password !== 'string' || !phone || !password) {
      return res.status(400).json({ message: 'মোবাইল নাম্বার ও পাসওয়ার্ড দিন' });
    }

    const driver = await Driver.findOne({ phone: phoneFilter(phone) }).select('+passwordHash');

    if (!driver) {
      return res.status(400).json({
        message: 'ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড'
      });
    }

    const match = await bcrypt.compare(password, driver.passwordHash);

    if (!match) {
      return res.status(400).json({
        message: 'ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড'
      });
    }

    const token = signToken(driver._id, 'driver');

    res.json({
      message: 'লগইন সফল হয়েছে',
      token,
      // ফ্রন্টএন্ড যে ফিল্ডগুলো পড়ে (id, _id, driverName, truckType...) সব পাঠানো হচ্ছে
      driver: safeDriver(driver)
    });
  } catch (error) {
    next(error);
  }
});

// =======================
// Driver - নিজের তথ্য / টোকেন চেক
// =======================
router.get('/me', requireDriver, (req, res) => {
  res.json({ driver: safeDriver(req.user) });
});

// =======================
// Update Location (লগইন করা ড্রাইভার শুধু নিজের লোকেশন বদলাতে পারবে)
// =======================
router.post('/location', requireDriver, async (req, res, next) => {
  try {
    const location = normalizeLocation(req.body);

    if (!location) {
      return res.status(400).json({ message: 'সঠিক লোকেশন পাওয়া যায়নি' });
    }

    await Driver.findByIdAndUpdate(req.user._id, { currentLocation: location });

    res.json({
      message: 'লোকেশন আপডেট হয়েছে'
    });
  } catch (error) {
    next(error);
  }
});

// =======================
// Driver Trip History (নিজের)
// =======================
router.get('/history', requireDriver, async (req, res, next) => {
  try {
    const history = await TripHistory.find({
      'acceptedDriver.driverId': req.user._id
    }).sort({
      completedAt: -1
    }).limit(200);

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// =======================
// Admin - নির্দিষ্ট ড্রাইভারের হিস্ট্রি
// =======================
router.get('/history/:driverId', requireAdmin, async (req, res, next) => {
  try {
    const history = await TripHistory.find({
      'acceptedDriver.driverId': req.params.driverId
    }).sort({
      completedAt: -1
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// =======================
// Admin - All Drivers (Step 2)
// =======================
router.get('/all', requireAdmin, async (req, res, next) => {
  try {
    const drivers = await Driver.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

// =======================
// Admin - Delete Driver (Step 2)
// =======================
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    // Driver Delete
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: 'ড্রাইভার পাওয়া যায়নি' });
    }

    // Pending Trip Applications থেকেও Remove
    // (আগে Trip.applicants থেকে মোছা হতো, কিন্তু আবেদন আসলে TripApplication কালেকশনে থাকে)
    await TripApplication.deleteMany({
      driverId: driver._id,
      status: 'pending'
    });

    res.json({
      message: 'ড্রাইভার সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
