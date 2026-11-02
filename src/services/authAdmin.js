import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Cria um usuário no Firebase Authentication usando uma instância temporária do Firebase App.
 * Isso evita que a sessão do Administrador logado no app seja substituída pela conta recém-criada.
 *
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function cadastrarUsuarioAuthSemLogin(email, senha) {
  const tempAppName = `temp-auth-creator-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    const credencial = await createUserWithEmailAndPassword(tempAuth, email, senha);
    await signOut(tempAuth);
    return credencial.user;
  } finally {
    try {
      await deleteApp(tempApp);
    } catch (e) {
      console.warn("Aviso ao liberar app temporário do Firebase:", e);
    }
  }
}
