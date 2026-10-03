// 🛡️ হালকা rate limiter (বাড়তি প্যাকেজ ছাড়া)
// একই IP থেকে নির্দিষ্ট সময়ে বেশি লগইন/সাইনআপ চেষ্টা আটকায়

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, message } = {}) {
  const hits = new Map();

  // পুরোনো এন্ট্রি মাঝে মাঝে পরিষ্কার, যাতে মেমোরি না বাড়ে
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        message: message || 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
      });
    }
    next();
  };
}

module.exports = { rateLimit };
