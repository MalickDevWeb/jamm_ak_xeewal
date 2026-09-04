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
// (utile pour les déploiements statiques où le .env n'est pas disponible au build)
const apiUrl = get('VITE_API_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.apiUrl) || "https://votre-api.com/api/v1"'
  : 'http://localhost:3001/api/v1');

const bacOfficeUrl = get('VITE_BAC_OFFICE_URL', isProduction
  ? '(typeof window !== "undefined" && window.env?.bacOfficeUrl) || "https://votre-backoffice.com"'
  : 'http://localhost:3001');

const vapidPublicKey = get('VITE_VAPID_PUBLIC_KEY', isProduction
  ? '(typeof window !== "undefined" && window.env?.vapidPublicKey) || ""'
  : 'BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc');

const sentryDsn = get('VITE_SENTRY_DSN', '');
const version = get('VITE_APP_VERSION', '1.0.0-dev');

const content = `// ============================================
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT PAR scripts/generate-env.js
// NE PAS MODIFIER À LA MAIN — modifier le fichier .env à la place
// ============================================
// Exécuter : node scripts/generate-env.js
// Ou : npm run prebuild (avant ng build)
export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}',
  bacOfficeUrl: '${bacOfficeUrl}',
  vapidPublicKey: '${vapidPublicKey}',
  sentryDsn: '${sentryDsn}',
  version: '${version}'
};
`;

const targetPath = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`✅ environment.ts généré depuis .env (${isProduction ? 'production' : 'development'})`);
console.log(`   apiUrl: ${apiUrl}`);
console.log(`   bacOfficeUrl: ${bacOfficeUrl}`);
