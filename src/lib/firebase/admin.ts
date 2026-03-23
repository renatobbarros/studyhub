import * as admin from 'firebase-admin';

/**
 * Inicializa o app do Firebase Admin se necessário e retorna a instância.
 */
function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey 
    ? rawKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n')
    : undefined;

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
    // Se for uma das funções de construção de query ou acesso
    const methods = ['collection', 'doc', 'where', 'orderBy', 'limit', 'auth', 'firestore'];
    if (methods.includes(prop)) {
      return () => new Proxy({}, mockHandler);
    }

    // Se for uma função de execução, retorna uma promise resolvida
    const execMethods = ['get', 'set', 'update', 'add', 'delete', 'verifyIdToken', 'createSessionCookie'];
    if (execMethods.includes(prop)) {
      return async () => ({
        id: 'mock-id',
        exists: false,
        empty: true,
        docs: [],
        data: () => ({}),
      });
    }

    // Fallback recursivo para permitir encadeamento infinito adminDb.foo().bar().baz()
    return new Proxy(() => new Proxy({}, mockHandler), mockHandler);
  }
};

/**
 * Proxies que decidem entre a instância real do Firebase ou um Mock silencioso.
 * Isso evita que o build do Next.js quebre ao tentar pré-renderizar páginas estáticas (como 404)
 * que podem indiretamente importar lógica de banco de dados.
 */
export const adminDb: any = new Proxy({}, {
  get: (target, prop) => {
    const app = getFirebaseAdmin();
    if (!app) return mockHandler.get(target, prop as string);
    return (app.firestore() as any)[prop];
  }
});

export const adminAuth: any = new Proxy({}, {
  get: (target, prop) => {
    const app = getFirebaseAdmin();
    if (!app) return mockHandler.get(target, prop as string);
    return (app.auth() as any)[prop];
  }
});
