import * as admin from 'firebase-admin';

/**
 * Inicializa o app do Firebase Admin se necessário e retorna a instância.
 */
function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  let privateKey = rawKey;
  
  if (privateKey) {
    // Tenta interpretar como JSON caso o Vercel tenha escapado com aspas duplas,
    // o que também já resolve o replace de \n.
    try {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = JSON.parse(privateKey);
      }
    } catch (e) {
      // Ignora erro de parse, continua para o replace manual
    }
    
    // Garante que os literais \n (texto) virem quebras de linha reais
    if (typeof privateKey === 'string') {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  }

  // No build do Vercel, as variáveis de ambiente sensíveis muitas vezes não estão disponíveis.
  // Retornamos null para que os proxies abaixo forneçam mocks básicos e não quebrem o build.
  if (!projectId || !clientEmail || !privateKey) {
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
    return admin;
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    return null;
  }
}

// Handler genérico para mocks de banco de dados e autenticação
const mockHandler = {
  get: (target: any, prop: string): any => {
    // Evita loop infinito se prop for transformado em string repetidamente
    if (typeof prop === 'symbol') return undefined;

    const methods = ['collection', 'doc', 'where', 'orderBy', 'limit', 'auth', 'firestore'];
    if (methods.includes(prop)) {
      return () => new Proxy({}, mockHandler);
    }

    // Se for uma função de execução, retorna uma promise resolvida
    const execMethods = ['get', 'set', 'update', 'add', 'delete', 'verifyIdToken', 'createSessionCookie', 'verifySessionCookie'];
    if (execMethods.includes(prop)) {
      return async () => ({
        uid: 'mock-user',
        id: 'mock-id',
        exists: false,
        empty: true,
        docs: [],
        data: () => ({}),
      });
    }

    // Fallback recursivo silenciado
    return new Proxy(() => new Proxy({}, mockHandler), mockHandler);
  }
};

/**
 * Proxies que decidem entre a instância real do Firebase ou um Mock silencioso.
 */
export const adminDb: any = new Proxy({}, {
  get: (target, prop) => {
    const app = getFirebaseAdmin();
    if (!app) {
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        console.warn(`[StudyHub Admin] Usando MOCK para adminDb.${String(prop)} - Verifique as ENVs.`);
      }
      return mockHandler.get(target, prop as string);
    }
    return (app.firestore() as any)[prop];
  }
});

export const adminAuth: any = new Proxy({}, {
  get: (target, prop) => {
    const app = getFirebaseAdmin();
    if (!app) {
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        console.warn(`[StudyHub Admin] Usando MOCK para adminAuth.${String(prop)} - Verifique as ENVs.`);
      }
      return mockHandler.get(target, prop as string);
    }
    return (app.auth() as any)[prop];
  }
});
