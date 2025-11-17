import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useContext, useRef, useState } from 'react';
import { useModalState, useOnMountUnsafe } from '../hooks';
import { useNavigate } from 'react-router-dom';

import { Modal, Button, Spinner, Form,  } from 'react-bootstrap';
import { getAuth, updateProfile, deleteUser } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';

let deletingUI: Promise<void> | null = null;

function Landing() {
    const firebaseUIAuthContainer = useRef<HTMLDivElement>(null);
    
    const navigate = useNavigate();
    
    const modalState = useModalState(false);

    const uiConfig:firebaseui.auth.Config = {
        /*signInSuccessUrl: '<url-to-redirect-to-on-success>',*/
        signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        /*firebase.auth.GoogleAuthProvider.PROVIDER_ID,*/
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true,
        },
        
        /*firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,*/
        ],
        autoUpgradeAnonymousUsers: true,
        popupMode: true,
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        /*tosUrl: '<your-tos-url>',*/
        // Privacy policy url/callback.
        /*privacyPolicyUrl: function() {
            window.location.assign('<your-privacy-policy-url>');
        }*/
       callbacks: {
        // signInFailure callback must be provided to handle merge conflicts which
        // occur when an existing credential is linked to an anonymous user.
        signInFailure: async (error) => {
            // For merge conflicts, the error.code will be
            // 'firebaseui/anonymous-upgrade-merge-conflict'.
            if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
                alert(error.toJSON());
                return ;
            }
            // The credential the user tried to sign in with.
            const cred = error.credential;
            // Copy data from anonymous user to permanent user and delete anonymous
            // user.
            // ...
            // Finish sign-in after data is copied.
            await firebase.auth().signInWithCredential(cred);
        },
        signInSuccessWithAuthResult: (authResult) => {
            console.log(authResult);

            if (authResult?.additionalUserInfo?.isNewUser || !authResult?.user?.displayName){
                modalState.setShow(true);
                return false;
            }
            
            navigate('/home');
            
            return false;
        }
       }
    };

    const [ ui , setUi] = useState<firebaseui.auth.AuthUI | null>(null);

    useOnMountUnsafe(() => {
        const promiseUI = (async () => {
            if (!firebaseUIAuthContainer.current)   return ;

            await deletingUI;

            console.log('awaited deletingUI to create new UI',deletingUI);

            const ui = new firebaseui.auth.AuthUI(firebase.auth(),'');

            setUi(ui);

            ui.start(firebaseUIAuthContainer.current,uiConfig);

            return ui;
        })();
        return () => {
            (async () => {
                const ui = await promiseUI;
                //console.log(deletingUI);
                await deletingUI;       //to be sure its done !!
                deletingUI = ui?.delete() ?? null;

                console.log('Delete Called for ui instance',ui);
            })();
        }
    });

    const [ btn1D, setBtn1D ] = useState(false);
    const [ btn2D, setBtn2D ] = useState(false);

    const inputElementRef = useRef<HTMLInputElement>(null);
    const formElementRef = useRef<HTMLFormElement>(null);

    const { user } = useContext(AuthContext);

    return (
        <div style={{width: '100%',height: '100%',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
            <div ref={firebaseUIAuthContainer} style={{width: '80%'}}></div>
            
            <Modal backdrop='static' show={modalState.show} onHide={modalState.handleClose} centered>
                <Modal.Header closeButton={false}>
                    <Modal.Title>Make yourself identifiable !!!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form ref={formElementRef}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Pseudo</Form.Label>
                            <Form.Control ref={inputElementRef} type="text" placeholder="Enter your pseudo" required/>
                            <Form.Text className="text-muted">
                                Will be visible amongst your contacts
                            </Form.Text>
                        </Form.Group>
                    </Form>
                    <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        hidden={!btn1D}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={btn1D} variant="secondary" onClick={async () => {
                        if (!user)      return ;

                        setBtn1D(true);
                        setBtn2D(true);
                        
                        try{
                            await getAuth().signOut();
                            await deleteUser(user);
                        }
                        catch(err){
                            alert(JSON.stringify(err));
                        }
                        
                        modalState.handleClose();
                        setBtn1D(false);
                        setBtn2D(false);

                        await navigate('/home');
                        await navigate('/');
                    }}>
                        Cancel
                    </Button>
                    <Button disabled={btn2D} variant="primary" onClick={async () => {
                        if (!user || !formElementRef.current?.reportValidity())      return ;
                        setBtn1D(true);
                        setBtn2D(true);
                        
                        try{
                            await updateProfile(user,{displayName: inputElementRef.current?.value});
                            modalState.handleClose();
                            navigate('/home');
                        }
                        catch(err){
                            alert(JSON.stringify(err));
                        }
                        
                        setBtn1D(false);
                        setBtn2D(false);
                    }}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Landing;