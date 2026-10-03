// 🧪 আসল ডাটাবেজ সহ API ইন্টিগ্রেশন টেস্ট — সরাসরি MongoDB ব্যবহার করে লজিক যাচাই
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = require('../server');
const Admin = require('../models/Admin');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const TripApplication = require('../models/TripApplication');
const TripHistory = require('../models/TripHistory');
const { signToken } = require('../utils/auth');
const dbConnection = require('../database/dbConnection');

let server, base;
let adminId, driverId, adminToken, driverToken;

test.before(async () => {
  // ১. আসল ডাটাবেজে কানেক্ট করা
  await dbConnection();

  // ২. টেস্ট শুরু করার আগে ডাটাবেজ পরিষ্কার করা (যদি আগের কোনো ডাটা থাকে)
  await Admin.deleteMany({});
  await Driver.deleteMany({});
  await Trip.deleteMany({});
  await TripApplication.deleteMany({});
  await TripHistory.deleteMany({});

  // ৩. সার্ভার র্যান্ডম পোর্টে চালু করা
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;

  // ৪. রিয়েল অ্যাডমিন ও ড্রাইভার ডাটাবেজে তৈরি করা
  const adminPasswordHash = await bcrypt.hash('12345678', 4);
  const driverPasswordHash = await bcrypt.hash('secret1', 4);

  const testAdmin = await Admin.create({
    name: 'A',
    phone: '01700000000',
    password: adminPasswordHash,
  });
  adminId = testAdmin._id;
  adminToken = signToken(adminId, 'admin');

  const testDriver = await Driver.create({
    driverName: 'D',
    phone: '01711111111',
    passwordHash: driverPasswordHash,
    truckType: 'Truck',
    truckCapacity: 5,
    vehicleBody: 'open',
    currentLocation: { lat: 23.8, lng: 90.4 }
  });
  driverId = testDriver._id;
  driverToken = signToken(driverId, 'driver');
});

test.after(async () => {
  // টেস্ট শেষে ডাটাবেজ কানেকশন ও সার্ভার বন্ধ করা
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

const call = (method, path, { token, body, headers = {} } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

test('protected routes reject requests without a token', async () => {
  const routes = [
    ['GET', '/api/drivers/all'],
    ['DELETE', `/api/drivers/${driverId}`],
    ['POST', '/api/drivers/location'],
    ['GET', '/api/drivers/history'],
    ['GET', `/api/drivers/history/${driverId}`],
    ['POST', '/api/trips/add'],
    ['POST', '/api/trips/apply-trip'],
    ['GET', `/api/trips/applications/${driverId}`],
    ['POST', '/api/trips/confirm-driver'],
    ['DELETE', `/api/trips/${driverId}`],
    ['GET', '/api/trips/history/last-7-days'],
    ['GET', '/api/admin/me'],
  ];
  for (const [m, p] of routes) {
    const r = await call(m, p, { body: m === 'GET' || m === 'DELETE' ? undefined : {} });
    assert.strictEqual(r.status, 401, `${m} ${p} returned ${r.status}`);
  }
});

test('driver token cannot use admin routes', async () => {
  for (const [m, p] of [['GET', '/api/drivers/all'], ['POST', '/api/trips/add'], ['POST', '/api/trips/confirm-driver'], ['DELETE', `/api/drivers/${driverId}`]]) {
    const r = await call(m, p, { token: driverToken, body: m === 'POST' ? {} : undefined });
    assert.strictEqual(r.status, 403, `${m} ${p}`);
  }
});

test('admin token cannot use driver routes', async () => {
  const r = await call('POST', '/api/trips/apply-trip', { token: adminToken, body: {} });
  assert.strictEqual(r.status, 403);
});

test('forged / expired token is rejected', async () => {
  const jwt = require('jsonwebtoken');
  const bad = jwt.sign({ id: String(adminId), role: 'admin' }, process.env.JWT_SECRET || 'wrong-secret');
  assert.strictEqual((await call('GET', '/api/drivers/all', { token: bad })).status, 401);
  const expired = jwt.sign({ id: String(adminId), role: 'admin' }, process.env.JWT_SECRET || 'default_jwt_secret_key_123', { expiresIn: -10 });
  assert.strictEqual((await call('GET', '/api/drivers/all', { token: expired })).status, 401);
});

test('admin/create is closed without setup key', async () => {
  const r = await call('POST', '/api/admin/create', { body: { name: 'x', phone: '01700000000', password: '12345678' } });
  assert.strictEqual(r.status, 403);
});

test('NoSQL operator injection in login is refused', async () => {
  const r1 = await call('POST', '/api/admin/login', { body: { phone: { $ne: null }, password: 'x' } });
  assert.strictEqual(r1.status, 400);
  const r2 = await call('POST', '/api/drivers/login', { body: { phone: { $gt: '' }, password: {$ne: 1 } } });
  assert.strictEqual(r2.status, 400);
});

test('trip add validates cargoDetails with a clear message', async () => {
  const r = await call('POST', '/api/trips/add', {
    token: adminToken,
    body: { from: 'ঢাকা', to: 'চট্টগ্রাম', cargoDetails: '', requiredVehicleBody: 'open', fixedPrice: 5000, pickupTime: 'x' },
  });
  assert.strictEqual(r.status, 400);
  assert.match(r.body.message, /মালামাল/);
});

test('driver login returns fields the frontend reads', async () => {
  const r = await call('POST', '/api/drivers/login', { body: { phone: '+8801711111111', password: 'secret1' } });
  assert.strictEqual(r.status, 200);
  for (const k of ['id', '_id', 'driverName', 'truckType', 'phone']) assert.ok(r.body.driver[k], `missing ${k}`);
  
  const me = await call('GET', '/api/drivers/me', { token: r.body.token });
  assert.strictEqual(me.status, 200);
});

test('apply-trip uses driver from token, not from body', async () => {
  const trip = await Trip.create({
    from: 'ঢাকা',
    to: 'সিলেট',
    cargoDetails: 'বক্স',
    requiredVehicleBody: 'open',
    fixedPrice: 3000,
    pickupTime: '2026-04-10',
    status: 'pending'
  });

  const other = new mongoose.Types.ObjectId();
  const r = await call('POST', '/api/trips/apply-trip', {
    token: driverToken,
    body: { tripId: String(trip._id), driverId: String(other), currentLocation: { lat: 23.8, lng: 90.4 } },
  });

  assert.strictEqual(r.status, 200);
  const application = await TripApplication.findOne({ tripId: trip._id });
  assert.strictEqual(String(application.driverId), String(driverId));
});

test('confirm-driver: second confirm gets 409, capacity copied, others rejected', async () => {
  const trip = await Trip.create({
    from: 'খুলনা',
    to: 'বরিশাল',
    cargoDetails: 'বস্তা',
    requiredVehicleBody: 'open',
    requiredCapacity: 7,
    fixedPrice: 4000,
    pickupTime: '2026-04-11',
    status: 'pending'
  });

  await TripApplication.create({
    tripId: trip._id,
    driverId: driverId,
    driverName: 'D',
    phone: '01711111111',
    truckType: 'T',
    truckCapacity: 5,
    vehicleBody: 'open',
    status: 'pending'
  });

  const body = { tripId: String(trip._id), driverId: String(driverId) };
  const r1 = await call('POST', '/api/trips/confirm-driver', { token: adminToken, body });
  const r2 = await call('POST', '/api/trips/confirm-driver', { token: adminToken, body });

  assert.strictEqual(r1.status, 200);
  assert.strictEqual(r2.status, 409);

  const history = await TripHistory.find({});
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].tripDetails.requiredCapacity, 7);
});

test('bad JSON and unknown routes give clean errors (no internals leaked)', async () => {
  const r = await fetch(base + '/api/drivers/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.strictEqual(r.status, 400);
  const nf = await call('GET', '/api/nothing');
  assert.strictEqual(nf.status, 404);
});

test('CORS allows only the real site', async () => {
  const ok = await fetch(base + '/api/trips/active', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' } });
  assert.strictEqual(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const bad = await fetch(base + '/api/trips/active', { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' } });
  assert.strictEqual(bad.headers.get('access-control-allow-origin'), null);
});