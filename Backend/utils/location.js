function normalizeLocation(location) {
  if (!location || location.lat === undefined || location.lng === undefined) return null;

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng, updatedAt: new Date() };
}

module.exports = { normalizeLocation };
