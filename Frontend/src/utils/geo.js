// 📍 ড্রাইভারের লোকেশন নেওয়া
// অনুমতি না দিলে বা GPS না থাকলে null ফেরত দেয় — তখনও আবেদন করা যাবে
export const getLocation = (timeout = 8000) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 60000 }
    );
  });
