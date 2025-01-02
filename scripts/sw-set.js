import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// __dirname 설정 (ES modules에서는 직접 사용할 수 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
dotenv.config();

// 환경변수 사용
// const VERSION = process.env.VITE_VERSION;
// const PUSHKEY = process.env.VITE_VAPID_PUBLIC_KEY;
const DOMAIN = process.env.SERVER_URL;
const swPath = resolve(__dirname, "../dist/sw.js");
let swContent = readFileSync(swPath, "utf-8");

swContent = swContent.replace("http://localhost:3000", DOMAIN);
// .replace("SW_VERSION", VERSION)
//   .replace("VAPID_PUBLIC_KEY", PUSHKEY);

writeFileSync(swPath, swContent);
