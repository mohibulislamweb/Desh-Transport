// 🖼️ অপ্টিমাইজড ছবি — মোবাইলে ছোট WebP (১৭–৪২KB), বড় স্ক্রিনে বড় WebP, পুরোনো ব্রাউজারে JPG
import bannerJpg from "./banner.jpeg";
import banner640 from "./opt/banner-640.webp";
import banner1200 from "./opt/banner-1200.webp";
import fleetJpg from "./fleet-highway.jpg";
import fleet480 from "./opt/fleet-highway-480.webp";
import fleet960 from "./opt/fleet-highway-960.webp";
import openJpg from "./open-truck-loading.jpg";
import open480 from "./opt/open-truck-loading-480.webp";
import open900 from "./opt/open-truck-loading-900.webp";
import trailerJpg from "./trailer-rain.jpg";
import trailer480 from "./opt/trailer-rain-480.webp";
import trailer900 from "./opt/trailer-rain-900.webp";
import driverJpg from "./driver-portrait.jpg";
import driver400 from "./opt/driver-portrait-400.webp";
import driver600 from "./opt/driver-portrait-600.webp";
import r1Jpg from "./review-1.jpg";
import r1_400 from "./opt/review-1-400.webp";
import r1_700 from "./opt/review-1-700.webp";
import r2Jpg from "./review-2.jpg";
import r2_400 from "./opt/review-2-400.webp";
import r2_700 from "./opt/review-2-700.webp";

const img = (fallback, small, sw, large, lw, sizes) => ({
  src: fallback,
  srcSet: `${small} ${sw}w, ${large} ${lw}w`,
  sizes
});

// sizes: মোবাইলে প্রায় পুরো চওড়া, ডেস্কটপে কলামের মাপ
const CARD = "(max-width: 900px) 92vw, 380px";

export const IMG = {
  banner: img(bannerJpg, banner640, 640, banner1200, 1200, "(max-width: 920px) 92vw, 640px"),
  fleet: img(fleetJpg, fleet480, 480, fleet960, 960, CARD),
  open: img(openJpg, open480, 480, open900, 900, CARD),
  trailer: img(trailerJpg, trailer480, 480, trailer900, 900, CARD),
  driver: img(driverJpg, driver400, 400, driver600, 600, "(max-width: 900px) 92vw, 520px"),
  review1: img(r1Jpg, r1_400, 400, r1_700, 700, "(max-width: 900px) 82vw, 380px"),
  review2: img(r2Jpg, r2_400, 400, r2_700, 700, "(max-width: 900px) 82vw, 380px"),
  driverCard: img(driverJpg, driver400, 400, driver600, 600, "(max-width: 900px) 82vw, 380px")
};
