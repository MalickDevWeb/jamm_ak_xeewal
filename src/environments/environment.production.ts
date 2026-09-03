export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).env?.apiUrl) || 'https://backofficexammakxeewal.vercel.app/api/v1',
  bacOfficeUrl: (typeof window !== 'undefined' && (window as any).env?.bacOfficeUrl) || 'https://backofficexammakxeewal.vercel.app',
  sentryDsn: (typeof window !== 'undefined' && (window as any).env?.sentryDsn) || 'https://2fbcffec5a5f1c0b0423f2ad48264833@o4512013434683392.ingest.de.sentry.io/4512013443530832',
  vapidPublicKey: (typeof window !== 'undefined' && (window as any).env?.vapidPublicKey) || 'BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc',
  version: '1.0.0'
};
