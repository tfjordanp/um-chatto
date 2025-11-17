import { createContext, useState, type JSX } from "react";
import type React from "react";

import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import firebase from "firebase/compat/app";
import { useOnMountUnsafe } from "../hooks";

export const AuthContext = createContext<{user: User | null}>({user: null});

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
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    });

    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;

