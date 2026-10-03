const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 🔐 লগইন টোকেন ৭ দিন পর্যন্ত বৈধ থাকবে
const TOKEN_TTL = '7d';

// ===============================
// ফোন নাম্বার একই ফরম্যাটে আনা (01XXXXXXXXX)
// +8801712..., 8801712..., 1712... সব একই নাম্বার হিসেবে ধরা হবে
// ===============================
function normalizePhone(value) {
  let phone = String(value || '').replace(/[^0-9]/g, '');
  if (phone.startsWith('8801') && phone.length === 13) phone = `0${phone.slice(3)}`;
  if (phone.startsWith('1') && phone.length === 10) phone = `0${phone}`;
  return phone;
}

function isValidBangladeshiPhone(phone) {
  return /^01\d{9}$/.test(phone);
}

// পুরোনো অ্যাকাউন্টে ফোন নাম্বার অন্য ফরম্যাটে সেভ থাকতে পারে, তাই সব রূপে খোঁজা হবে
function phoneLookupValues(rawPhone) {
  const normalized = normalizePhone(rawPhone);
  const values = new Set([normalized]);
  if (normalized) {
    values.add(`+88${normalized}`);
    values.add(`88${normalized}`);
  }
  if (typeof rawPhone === 'string' && rawPhone.trim()) values.add(rawPhone.trim());
  return [...values];
}

// 🛡️ sanitizeFilter চালু থাকায় নিজের লেখা $in কুয়েরি mongoose.trusted() দিয়ে দিতে হয়
function phoneFilter(rawPhone) {
  return mongoose.trusted({ $in: phoneLookupValues(rawPhone) });
}

// ===============================
// JWT টোকেন (role সহ: 'admin' অথবা 'driver')
// ===============================
function signToken(userId, role) {
  return jwt.sign({ id: String(userId), role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ===============================
// ক্লায়েন্টকে পাঠানোর নিরাপদ তথ্য (পাসওয়ার্ড হ্যাশ কখনো যাবে না)
// id এবং _id দুটোই রাখা হলো যাতে পুরোনো ফ্রন্টএন্ড কোডও কাজ করে
// ===============================
function safeDriver(driver) {
  return {
    id: driver._id,
    _id: driver._id,
    driverName: driver.driverName,
    name: driver.driverName,
    phone: driver.phone,
    truckType: driver.truckType,
    truckCapacity: driver.truckCapacity,
    vehicleBody: driver.vehicleBody,
    currentLocation: driver.currentLocation,
  };
}

function safeAdmin(admin) {
  return { id: admin._id, _id: admin._id, name: admin.name, phone: admin.phone };
}

module.exports = {
  isValidBangladeshiPhone,
  normalizePhone,
  phoneFilter,
  phoneLookupValues,
  safeAdmin,
  safeDriver,
  signToken,
  verifyToken,
};
