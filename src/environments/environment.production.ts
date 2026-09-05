// ============================================
// FICHIER GENERE AUTOMATIQUEMENT PAR scripts/generate-env.js
// NE PAS MODIFIER A LA MAIN — valeurs injectees depuis l'environnement
// ============================================
export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).env?.apiUrl) || 'http://localhost:3001/api/v1',
  bacOfficeUrl: (typeof window !== 'undefined' && (window as any).env?.bacOfficeUrl) || 'http://localhost:3001',
  vapidPublicKey: (typeof window !== 'undefined' && (window as any).env?.vapidPublicKey) || 'BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc',
  sentryDsn: (typeof window !== 'undefined' && (window as any).env?.sentryDsn) || '',
  publicUrl: (typeof window !== 'undefined' && (window as any).env?.publicUrl) || 'https://jammakxeewal.sn',
  publicEmail: (typeof window !== 'undefined' && (window as any).env?.publicEmail) || 'contact@jammakxeewal.sn',
  publicSiteUrl: (typeof window !== 'undefined' && (window as any).env?.publicSiteUrl) || 'https://jammakxeewal.sn',
  version: (typeof window !== 'undefined' && (window as any).env?.version) || '1.0.0-dev'
};
