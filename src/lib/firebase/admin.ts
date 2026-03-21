import * as admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    // Limpeza robusta: remove aspas extras no início/fim e converte \n literais em quebras reais
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawKey 
      ? rawKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n')
      : undefined;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin credentials missing or malformed.');
      return null;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      return null;
    }
  }
  return admin;
}

// Utility to get admin without top-level failures
export const adminDb = (() => {
  try {
    const app = getFirebaseAdmin();
    return app ? app.firestore() : null;
  } catch (error) {
    console.error('Failed to initialize adminDb', error);
    return null;
  }
})() as any;

export const adminAuth = (() => {
  try {
    const app = getFirebaseAdmin();
    return app ? app.auth() : null;
  } catch (error) {
    console.error('Failed to initialize adminAuth', error);
    return null;
  }
})() as any;
