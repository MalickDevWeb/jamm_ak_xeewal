const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger .env à la racine du projet Angular
const envPath = path.resolve(__dirname, '..', '.env');
const envConfig = dotenv.config({ path: envPath, override: true });

if (envConfig.error) {
  console.warn('⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut.');
}

const parsed = envConfig.parsed || {};

// Fonction utilitaire pour récupérer une variable avec fallback
function get(key, fallback) {
  return parsed[key] || process.env[key] || fallback;
}

// Déterminer si on est en production
const isProduction = process.env.NODE_ENV === 'production';

// Pour la production, on utilise window.env comme fallback runtime
const apiUrl = get('VITE_API_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.apiUrl) || ""'
  : 'http://localhost:3001/api/v1');

const bacOfficeUrl = get('VITE_BAC_OFFICE_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.bacOfficeUrl) || ""'
  : 'http://localhost:3001');

const vapidPublicKey = get('VITE_VAPID_PUBLIC_KEY', isProduction
  ? '(typeof window !== "undefined" && window.env?.vapidPublicKey) || ""'
  : 'BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc');

const sentryDsn = get('VITE_SENTRY_DSN', '');
const publicUrl = get('VITE_PUBLIC_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.publicUrl) || ""'
  : 'http://localhost:4200');
const publicEmail = get('VITE_PUBLIC_EMAIL', isProduction
  ? '(typeof window !== "undefined" && window.env?.publicEmail) || ""'
  : 'contact@jammakxeewal.sn');
const publicSiteUrl = get('VITE_PUBLIC_SITE_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.publicSiteUrl) || ""'
  : 'https://jammakxeewal.sn');
const version = get('VITE_APP_VERSION', '1.0.0-dev');

const lines = [];
lines.push("// ============================================");
lines.push("// FICHIER GENERE AUTOMATIQUEMENT PAR scripts/generate-env.js");
lines.push("// NE PAS MODIFIER A LA MAIN — modifier le fichier .env a la place");
lines.push("// ============================================");
lines.push("// Executer : node scripts/generate-env.js");
lines.push("// Ou : npm run prebuild (avant ng build)");
lines.push("export const environment = {");
lines.push("  production: " + isProduction + ",");
lines.push("  apiUrl: '" + apiUrl + "',");
lines.push("  bacOfficeUrl: '" + bacOfficeUrl + "',");
lines.push("  vapidPublicKey: '" + vapidPublicKey + "',");
lines.push("  sentryDsn: '" + sentryDsn + "',");
lines.push("  publicUrl: '" + publicUrl + "',");
lines.push("  publicEmail: '" + publicEmail + "',");
lines.push("  publicSiteUrl: '" + publicSiteUrl + "',");
lines.push("  version: '" + version + "'");
lines.push("};");

const content = lines.join("\n") + "\n";

const targetPath = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log("environment.ts genere depuis .env (" + (isProduction ? 'production' : 'development') + ")");
console.log('   apiUrl: ' + apiUrl);
console.log('   bacOfficeUrl: ' + bacOfficeUrl);
console.log('   publicUrl: ' + publicUrl);
console.log('   publicEmail: ' + publicEmail);
console.log('   publicSiteUrl: ' + publicSiteUrl);
