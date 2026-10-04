# 🚚 দেশ ট্রান্সপোর্ট এজেন্সি — Frontend

লাইভ: https://desh-transport-tau.vercel.app/ ·

React 19 + Vite + framer-motion (3D অ্যানিমেশন) + lucide-react আইকন।

## পেজসমূহ

| পথ | কাজ |
|---|---|
| `/` | ল্যান্ডিং পেজ — 3D হিরো, গাড়ির বহর, আসল লাইভ ট্রিপ, চালকদের মতামত, 3D বাংলাদেশ ম্যাপ ব্যাকগ্রাউন্ড |
| `/trips` | সবার জন্য লাইভ ট্রিপ তালিকা (সার্চ/ফিল্টার), লগইন থাকলে সরাসরি আবেদন |
| `/login` | ড্রাইভার লগইন ও রেজিস্ট্রেশন (`/login?mode=signup`) |
| `/driver` | ড্রাইভার ড্যাশবোর্ড — নতুন ট্রিপ, আমার আবেদন (স্ট্যাটাস), সম্পন্ন ট্রিপ, লোকেশন আপডেট |
| `/admin-login` | এডমিন লগইন |
| `/admin` | এডমিন প্যানেল — ওভারভিউ, ট্রিপ যোগ/মুছা, আবেদন দেখে কনফার্ম, সফল ট্রিপ, ড্রাইভার তালিকা |

`/driver` ও `/admin` লগইন ছাড়া খোলে না। টোকেন শেষ হলে নিজে থেকেই লগইন পেজে পাঠায়।

## লোকালি চালানো

```bash
npm install
npm run dev
```

ব্যাকএন্ডের ঠিকানা বদলাতে `.env` ফাইলে: `VITE_API_URL=http://localhost:5000`
(না দিলে Render এর ঠিকানা ব্যবহার হবে)। সব API কল `src/config.js` থেকে যায়।

## ফোল্ডার

- `src/config.js` — API ঠিকানা, টোকেনসহ axios (`adminApi`, `driverApi`, `publicApi`)
- `src/theme.css` — রং, বাটন, কার্ড, ফর্ম (ডিজাইন সিস্টেম)
- `src/components/` — `Tilt3D` (3D কার্ড), `Toast` (নোটিফিকেশন), `TripCard`, `AuthShell`, `Logo`, `Counter`, `AppHeader`
- `src/MapWatermark.jsx` + `src/mapData.js` — 3D অ্যানিমেটেড বাংলাদেশ ম্যাপ
- `vercel.json` — রিফ্রেশ দিলে 404 না আসার জন্য SPA rewrite


# 🚚 দেশ ট্রান্সপোর্ট — Backend API

Express 5 + MongoDB (Mongoose) + JWT। Render এ চলে: render:https://desh-transport.onrender.com

## Environment (Render → Environment)

| নাম | দরকার | কাজ |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas কানেকশন |
| `JWT_SECRET` | ✅ | লম্বা র‍্যান্ডম সিক্রেট |
| `ALLOWED_ORIGIN` | ঐচ্ছিক | কোন সাইট থেকে API কল করা যাবে (ডিফল্ট `https://desh-transport.vercel.app`) |
| `ADMIN_SETUP_KEY` | শুধু নতুন এডমিন বানানোর সময় | কাজ শেষে মুছে দিন |

## API

🔓 = সবার জন্য, 🚚 = ড্রাইভার টোকেন, 🛡️ = এডমিন টোকেন (`Authorization: Bearer <token>`)

| Method | Path | কে | কাজ |
|---|---|---|---|
| POST | `/api/drivers/signup` | 🔓 | ড্রাইভার রেজিস্ট্রেশন |
| POST | `/api/drivers/login` | 🔓 | লগইন → `token`, `driver` |
| GET | `/api/drivers/me` | 🚚 | নিজের তথ্য |
| POST | `/api/drivers/location` | 🚚 | `{lat, lng}` লোকেশন আপডেট |
| GET | `/api/drivers/history` | 🚚 | নিজের সম্পন্ন ট্রিপ |
| GET | `/api/drivers/all` | 🛡️ | সব ড্রাইভার |
| GET | `/api/drivers/history/:driverId` | 🛡️ | নির্দিষ্ট ড্রাইভারের হিস্ট্রি |
| DELETE | `/api/drivers/:id` | 🛡️ | ড্রাইভার + তার pending আবেদন মোছা |
| GET | `/api/trips/active` | 🔓 | চালু (pending) ট্রিপ |
| POST | `/api/trips/apply-trip` | 🚚 | `{tripId, currentLocation?}` — ড্রাইভার টোকেন থেকে নেওয়া হয় |
| GET | `/api/trips/my-applications` | 🚚 | নিজের আবেদন ও স্ট্যাটাস |
| POST | `/api/trips/add` | 🛡️ | নতুন ট্রিপ |
| GET | `/api/trips/applications/:tripId` | 🛡️ | ট্রিপের pending আবেদন |
| POST | `/api/trips/confirm-driver` | 🛡️ | `{tripId, driverId}` — atomic, বাকিরা rejected |
| DELETE | `/api/trips/:id` | 🛡️ | ট্রিপ মোছা |
| GET | `/api/trips/history/last-7-days` | 🛡️ | শেষ ৭ দিনের সফল ট্রিপ |
| POST | `/api/admin/login` | 🔓 | এডমিন লগইন |
| GET | `/api/admin/me` | 🛡️ | টোকেন চেক |
| POST | `/api/admin/create` | `x-setup-key` হেডার | নতুন এডমিন (শুধু `ADMIN_SETUP_KEY` সেট থাকলে) |

## নিরাপত্তা

- প্রতিটি রাউটে role-সহ JWT গার্ড; ড্রাইভার টোকেন দিয়ে এডমিনের কাজ করা যায় না
- `sanitizeFilter` দিয়ে NoSQL injection বন্ধ, সব ইনপুট যাচাই
- লগইন/সাইনআপে rate limit, CORS শুধু নিজের সাইটে
- ভেতরের error মেসেজ ক্লায়েন্টে যায় না

## কমান্ড

```bash
npm install
npm run dev       # লোকাল সার্ভার
npm test          # API টেস্ট (ডাটাবেজ লাগে না)
npm run cleanup   # একবার: পুরোনো ভাঙা আবেদন পরিষ্কার (MONGO_URI লাগে)
```
