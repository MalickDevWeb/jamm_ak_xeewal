// ============================================
// FICHIER DE PRODUCTION — Fallbacks pour déploiements statiques
// Les vraies valeurs DOIVENT être injectées via window.env au runtime
// (voir index.html : <script>window.env = {...}</script>)
// ============================================
export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).env?.apiUrl) || '',
  bacOfficeUrl: (typeof window !== 'undefined' && (window as any).env?.bacOfficeUrl) || '',
  vapidPublicKey: (typeof window !== 'undefined' && (window as any).env?.vapidPublicKey) || '',
  sentryDsn: (typeof window !== 'undefined' && (window as any).env?.sentryDsn) || '',
  publicUrl: (typeof window !== 'undefined' && (window as any).env?.publicUrl) || '',
  publicEmail: (typeof window !== 'undefined' && (window as any).env?.publicEmail) || '',
  publicSiteUrl: (typeof window !== 'undefined' && (window as any).env?.publicSiteUrl) || '',
  version: (typeof window !== 'undefined' && (window as any).env?.version) || '1.0.0'
};
