// 📍 ড্রাইভারের সঠিক লোকেশন নেওয়া (হাই-অ্যাকুরেসি GPS, পুরোনো ক্যাশ নয়)
// সফল হলে { lat, lng, accuracy } — না হলে { error: "বাংলায় কারণ" }
export const getLocation = (timeout = 15000) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve({ error: "আপনার ডিভাইসে GPS/লোকেশন সাপোর্ট নেই" });
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        }),
      (err) =>
        resolve({
          error:
            err.code === 1
              ? "লোকেশনের অনুমতি দেওয়া হয়নি। ব্রাউজারের ঠিকানার পাশে 🔒 চেপে Location → Allow করুন।"
              : err.code === 3
                ? "লোকেশন পেতে দেরি হচ্ছে। খোলা জায়গায় গিয়ে GPS চালু রেখে আবার চেষ্টা করুন।"
                : "লোকেশন পাওয়া যায়নি। ফোনের Location/GPS চালু করে আবার চেষ্টা করুন।"
        }),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
