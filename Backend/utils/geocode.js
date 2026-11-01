// 🗺️ GPS কো-অর্ডিনেট থেকে জায়গার নাম (বাংলায়) — OpenStreetMap Nominatim
// নিয়ম মেনে: নিজস্ব User-Agent, ক্যাশ, আর সেকেন্ডে ১টির বেশি রিকোয়েস্ট নয়
const cache = new Map();
let lastCall = 0;

const UA = 'DeshTransport/1.0 (https://desh-transport-bd.vercel.app)';

function shortName(address = {}) {
  const parts = [
    address.road || address.neighbourhood || address.suburb || address.hamlet || address.quarter,
    address.village || address.town || address.city || address.municipality,
    address.county,
    address.state_district,
  ].filter(Boolean);
  return [...new Set(parts)].join(', ');
}

async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);

  const wait = 1100 - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=bn`;
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`geocode ${res.status}`);
  const data = await res.json();

  const name = shortName(data.address) || data.display_name || null;
  if (cache.size > 2000) cache.clear();
  cache.set(key, name);
  return name;
}

// লোকেশনে জায়গার নাম বসানো — ব্যর্থ হলে ক্লায়েন্টের পাঠানো নাম রেখে দেয়
async function withPlaceName(location) {
  if (!location) return location;
  try {
    const name = await reverseGeocode(location.lat, location.lng);
    if (name) return { ...location, placeName: name };
  } catch (error) {
    console.warn('⚠️ জায়গার নাম পাওয়া যায়নি:', error.message);
  }
  return location;
}

module.exports = { reverseGeocode, withPlaceName };