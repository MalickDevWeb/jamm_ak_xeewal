const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger .env à la racine du projet Angular s'il existe (local uniquement)
const envPath = path.resolve(__dirname, '..', '.env');
const envConfig = dotenv.config({ path: envPath, override: false });

const parsed = envConfig.parsed || {};

// Fonction utilitaire pour récupérer une variable (supporte VITE_NOM et NOM)
function get(key, fallback = '') {
  const altKey = key.startsWith('VITE_') ? key.replace('VITE_', '') : `VITE_${key}`;
  return (
    process.env[key] ||
    parsed[key] ||
    process.env[altKey] ||
    parsed[altKey] ||
    fallback
  ).trim();
}

// Déterminer si on est en production
const isProduction = process.env.NODE_ENV === 'production';

// Fonction pour garantir le protocole http/https sur les URLs
function ensureProtocol(url) {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
    return 'http://' + url;
  }
  return 'https://' + url;
}

// Récupération stricte depuis l'environnement (Vercel ou .env local)
const apiUrl = ensureProtocol(get('VITE_API_URL', 'http://localhost:3001/api/v1'));
const bacOfficeUrl = ensureProtocol(get('VITE_BAC_OFFICE_URL', 'http://localhost:3001'));
const vapidPublicKey = get('VITE_VAPID_PUBLIC_KEY', '');
const sentryDsn = get('VITE_SENTRY_DSN', '');
const publicUrl = ensureProtocol(get('VITE_PUBLIC_URL', 'http://localhost:4200'));
const publicEmail = get('VITE_PUBLIC_EMAIL', 'contact@jammakxeewal.sn');
const publicSiteUrl = ensureProtocol(get('VITE_PUBLIC_SITE_URL', 'https://jammakxeewal.sn'));
const version = get('VITE_APP_VERSION', '1.0.0');

// 1. Contenu de environment.ts et environment.production.ts
function generateEnvironmentFile(prod) {
  return [
    "// ============================================",
    "// FICHIER GENERE AUTOMATIQUEMENT PAR scripts/generate-env.js",
    "// NE PAS MODIFIER A LA MAIN — valeurs injectees depuis l'environnement",
    "// ============================================",
    "function cleanUrl(url: any, fallback: string): string {",
    "  const u = (url || fallback || '').trim();",
    "  if (!u) return '';",
    "  if (u.startsWith('http://') || u.startsWith('https://')) return u;",
    "  if (u.startsWith('localhost') || u.startsWith('127.0.0.1')) return 'http://' + u;",
    "  return 'https://' + u;",
    "}",
    "",
    "export const environment = {",
    `  production: ${prod},`,
    `  apiUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.apiUrl), '${apiUrl}'),`,
    `  bacOfficeUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.bacOfficeUrl), '${bacOfficeUrl}'),`,
    `  vapidPublicKey: (typeof window !== 'undefined' && (window as any).env?.vapidPublicKey) || '${vapidPublicKey}',`,
    `  sentryDsn: (typeof window !== 'undefined' && (window as any).env?.sentryDsn) || '${sentryDsn}',`,
    `  publicUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.publicUrl), '${publicUrl}'),`,
    `  publicEmail: (typeof window !== 'undefined' && (window as any).env?.publicEmail) || '${publicEmail}',`,
    `  publicSiteUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.publicSiteUrl), '${publicSiteUrl}'),`,
    `  version: (typeof window !== 'undefined' && (window as any).env?.version) || '${version}'`,
    "};",
    ""
  ].join("\n");
}

// 2. Écriture de environment.ts et environment.production.ts
const envDir = path.resolve(__dirname, '..', 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(path.join(envDir, 'environment.ts'), generateEnvironmentFile(false), 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.production.ts'), generateEnvironmentFile(true), 'utf8');

// 3. Génération de src/assets/env.js (pour chargement runtime par index.html)
const assetsDir = path.resolve(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const envJsContent = [
  "// Variables d'environnement injectees au runtime",
  "window.env = {",
  `  apiUrl: "${apiUrl}",`,
  `  bacOfficeUrl: "${bacOfficeUrl}",`,
  `  vapidPublicKey: "${vapidPublicKey}",`,
  `  sentryDsn: "${sentryDsn}",`,
  `  publicUrl: "${publicUrl}",`,
  `  publicEmail: "${publicEmail}",`,
  `  publicSiteUrl: "${publicSiteUrl}",`,
  `  version: "${version}"`,
  "};",
  ""
].join("\n");

fs.writeFileSync(path.join(assetsDir, 'env.js'), envJsContent, 'utf8');

console.log("Environnements Angular generes avec succes depuis l'environnement actif :");
console.log('   apiUrl: ' + apiUrl);
console.log('   bacOfficeUrl: ' + bacOfficeUrl);
console.log('   publicUrl: ' + publicUrl);
console.log('   publicEmail: ' + publicEmail);
console.log('   publicSiteUrl: ' + publicSiteUrl);
