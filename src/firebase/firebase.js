import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAFfOj2R_KPaR0Jw6IRLki4Ou9H51Kxbpc",
  authDomain: "nitteityousei-83cc3.firebaseapp.com",
  projectId: "nitteityousei-83cc3",
  storageBucket: "nitteityousei-83cc3.firebasestorage.app",
  messagingSenderId: "916655395327",
  appId: "1:916655395327:web:9cfb6ed7b16be0851657ca"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)