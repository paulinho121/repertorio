import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// NOTA: Em produção, essas chaves devem estar em variáveis de ambiente
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "repertorio-facil-demo.firebaseapp.com",
  projectId: "repertorio-facil-demo",
  storageBucket: "repertorio-facil-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
