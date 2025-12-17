import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 從 Firebase Console -> Project Settings 複製你的設定
const firebaseConfig = {
  apiKey: 'AIzaSyCTWSZV3V1CY-YBY4V-h1Oejja3bMHIbxk',
  authDomain: 'react-monorepo-demo.firebaseapp.com',
  projectId: 'react-monorepo-demo',
  storageBucket: 'react-monorepo-demo.firebasestorage.app',
  messagingSenderId: '240947310802',
  appId: '1:240947310802:web:b9815873e7363620157d0b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
