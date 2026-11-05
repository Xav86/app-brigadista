import AsyncStorage from "@react-native-async-storage/async-storage";
import { isSupported, getAnalytics } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// No celular a sessão do Firebase fica salva no AsyncStorage, assim o usuário continua
// logado depois de fechar o app (e o login com biometria consegue reaproveitar a sessão).
// Na Web o próprio Firebase já guarda a sessão no navegador.
function criarAuth() {
  if (Platform.OS === "web") return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (erro) {
    // initializeAuth só pode ser chamado uma vez (ex.: depois de um reload do Expo).
    return getAuth(app);
  }
}

export const auth = criarAuth();

// Analytics do Firebase JS SDK só é suportado na Web (evita erro no Android/iOS nativo).
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
