// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cole aqui os dados copiados do console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBub3XfCpU9-6XyYFXhyRfaqJITN6MoND8",
  authDomain: "teste-3c2c1.firebaseapp.com",
  projectId: "teste-3c2c1",
  storageBucket: "teste-3c2c1.firebasestorage.app",
  messagingSenderId: "608669319854",
  appId: "1:608669319854:web:7c140fd9a1125f68ab633f"
};


// Inicializa o app e o banco
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);