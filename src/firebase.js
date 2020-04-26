import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/storage';

var firebaseConfig = {
    apiKey: "AIzaSyBLHYeag273-F8L_funDb_8iUZO7BGZZW8",
    authDomain: "chat-app-55e32.firebaseapp.com",
    databaseURL: "https://chat-app-55e32.firebaseio.com",
    projectId: "chat-app-55e32",
    storageBucket: "chat-app-55e32.appspot.com",
    messagingSenderId: "485337347226",
    appId: "1:485337347226:web:04974d75cec0bcef055b23",
    measurementId: "G-E3QSED8X11"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.database();
export const sdb = firebaseApp.firestore();
export const st = firebaseApp.storage();