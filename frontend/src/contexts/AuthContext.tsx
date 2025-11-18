import { createContext, useState, type JSX } from "react";
import type React from "react";

import { getAuth, onAuthStateChanged, type User, } from "firebase/auth";
import firebase from "firebase/compat/app";
import { useOnMountUnsafe } from "../hooks";

import { ref, set, getDatabase } from "firebase/database";

export const AuthContext = createContext<{user: User | null,updateRTDBInfo: (user:User|null) => Promise<void>}>
({user: null,updateRTDBInfo: ()=>Promise.resolve()});


async function updateRTDBInfo(user: User|null){
    if (user){
        const db = getDatabase();
        const contactsRef = ref(db, `users/${user.uid}/info`);
        await set(contactsRef,{
            displayName: user.displayName,
            uid: user.uid,
            photoURL: user.photoURL,
            email: user.email,
        } as Pick<User,'displayName'|'uid'|'photoURL'|'email'>);
    }
}

const AuthContextProvider: React.FC<{children: JSX.Element}> = ({children}) => {
    const [ user, setUser ] = useState<User | null>(null);

    useOnMountUnsafe(() => {
    
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
            databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            console.log('onAuthStateChanged CALLED');
            setUser(user);
            updateRTDBInfo(user);
        });
    });

    return (
        <AuthContext.Provider value={{user,updateRTDBInfo}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;

