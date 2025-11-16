import './App.css'

import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useRef } from 'react';
import { useOnMountUnsafe } from './hooks';

function App() {
  const firebaseUIAuthContainer = useRef<HTMLDivElement>(null);

  const uiConfig:firebaseui.auth.Config = {
      /*signInSuccessUrl: '<url-to-redirect-to-on-success>',*/
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        /*firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,*/
      ],
      popupMode: true,
      signInSuccessUrl: '/go'
      // tosUrl and privacyPolicyUrl accept either url string or a callback
      // function.
      // Terms of service url/callback.
      /*tosUrl: '<your-tos-url>',*/
      // Privacy policy url/callback.
      /*privacyPolicyUrl: function() {
        window.location.assign('<your-privacy-policy-url>');
      }*/
    };

  useOnMountUnsafe(() => {
    if (!firebaseUIAuthContainer.current)   return ;

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
    const app = firebase.initializeApp(firebaseConfig);

    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    
    ui.start(firebaseUIAuthContainer.current,uiConfig);

  });
  
  return (
    <>
      <div ref={firebaseUIAuthContainer}></div>
    </>
  )
}

export default App
