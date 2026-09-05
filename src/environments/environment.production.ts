// ============================================
// FICHIER GENERE AUTOMATIQUEMENT PAR scripts/generate-env.js
// NE PAS MODIFIER A LA MAIN — valeurs injectees depuis l'environnement
// ============================================
function cleanUrl(url: any, fallback: string): string {
  const u = (url || fallback || '').trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('localhost') || u.startsWith('127.0.0.1')) return 'http://' + u;
  return 'https://' + u;
}

export const environment = {
  production: true,
  apiUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.apiUrl), 'http://localhost:3001/api/v1'),
  bacOfficeUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.bacOfficeUrl), 'http://localhost:3001'),
  vapidPublicKey: (typeof window !== 'undefined' && (window as any).env?.vapidPublicKey) || 'BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc',
  sentryDsn: (typeof window !== 'undefined' && (window as any).env?.sentryDsn) || '',
  publicUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.publicUrl), 'https://jammakxeewal.sn'),
  publicEmail: (typeof window !== 'undefined' && (window as any).env?.publicEmail) || 'contact@jammakxeewal.sn',
  publicSiteUrl: cleanUrl((typeof window !== 'undefined' && (window as any).env?.publicSiteUrl), 'https://jammakxeewal.sn'),
  version: (typeof window !== 'undefined' && (window as any).env?.version) || '1.0.0-dev'
};
