const Admin = require('../models/Admin');
const Driver = require('../models/Driver');
const { verifyToken } = require('../utils/auth');

// 🛡️ role অনুযায়ী লগইন চেক: authenticate('admin') অথবা authenticate('driver')
function authenticate(role) {
  const Model = role === 'admin' ? Admin : Driver;

  return async (req, res, next) => {
    try {
      const authorization = req.headers.authorization || '';
      const [scheme, token] = authorization.split(' ');
      if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'লগইন ছাড়া এই কাজটি করা যাবে না।' });
      }

      let payload;
      try {
        payload = verifyToken(token);
      } catch {
        return res.status(401).json({ message: 'আপনার সেশনটি শেষ হয়ে গেছে। আবার লগইন করুন।' });
      }

      // ড্রাইভারের টোকেন দিয়ে এডমিনের কাজ (বা উল্টোটা) করা যাবে না
      if (payload.role !== role) {
        return res.status(403).json({ message: 'এই কাজের অনুমতি আপনার নেই।' });
      }

      // ইউজার মুছে ফেলা হলে পুরোনো টোকেনও আর কাজ করবে না
      const user = await Model.findById(payload.id);
      if (!user) {
        return res.status(401).json({ message: 'আপনার সেশনটি শেষ হয়ে গেছে। আবার লগইন করুন।' });
      }

      req.user = user;
      req.role = role;
      next();
    } catch (error) {
      next(error);
    }
  };
}

const requireAdmin = authenticate('admin');
const requireDriver = authenticate('driver');

module.exports = { authenticate, requireAdmin, requireDriver };
