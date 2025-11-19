import { createContext, useContext, useState, type JSX } from "react";
import type React from "react";

import { getDatabase, ref, push, set, serverTimestamp, onValue, get, DataSnapshot, type DatabaseReference, off } from "firebase/database";
import { useOnMountUnsafe } from "../hooks";
import { AuthContext } from "./AuthContext";
import type { User } from "firebase/auth";

interface ChatContextValue{
    sendMessage: (message: Omit<Message,'srcId'|'timestamp'>) => Promise<any>;
    addContact: (uid:string) => Promise<any>;
    listAllContacts: () => Promise<{uid:string,adder:string}[]>;
    listAllMessages: () => Promise<Message[]>;
    getProfile: (uid:string) => Promise<Pick<User,'displayName'|'uid'|'photoURL'|'email'> | null>;
    normalizeId: (humanLikeUid:string) => string;

    onContactsChanged(listener: (list: {
        uid: string;
        adder: string;
    }[]) => Promise<void>): () => void;
    onMessagesChanged(listener: (list: Message[]) => Promise<void>): () => void;

    sendIsOnlineSignal(): Promise<void>;
    readIsOnlineSignal(uid: string): Promise<{
        timestamp: number;
    }>

    serverTimeMs: {
        get: () => number;
    };

}

export const ChatContext = createContext<ChatContextValue | null>(null);

interface Message{
    //mime type
    text: string;
    mediaUrl?: string;
    srcId: string;
    dstId: string;
    timestamp: any;
}

//Class::toJSON, Class::dataObject

const ChatContextProvider: React.FC<{children: JSX.Element}> = ({children}) => {

    const { user } = useContext(AuthContext);

    const db = getDatabase();

    if (!user){
        return (
            <ChatContext.Provider value={null}>
                {children}
            </ChatContext.Provider>
        );
    }

    const [ serverTimeMs, setServerTimeMs ] = useState({get: () => Date.now()});

    useOnMountUnsafe(() => {
        const offsetRef = ref(db, ".info/serverTimeOffset");

        onValue(offsetRef, (snapshot) => {
            const offset = snapshot.val() || 0; // Get the offset value, default to 0 if null

            // Calculate the estimated server time
            //const estimatedServerTimeMs = Date.now() + offset;

            setServerTimeMs({get: () => Date.now() + offset});

            /*console.log("Realtime Database server time offset (ms):", offset);
            console.log("Estimated current server time (ms since epoch):", estimatedServerTimeMs);
            console.log("Estimated current server time (Date object):", new Date(estimatedServerTimeMs));*/

            // You can use this `estimatedServerTimeMs` in your client logic if needed,
            // but remember its limitations.
        }, { onlyOnce: false }); // Set to true if you only need it once
    });

    async function getDataAtPath(path:string) {
        const dataRef = ref(db, path);

        try {
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                //console.log(`Data at path '${path}':`, data);
                return data;
            } 
            else {
                console.log(`No data available at path: '${path}'`);
                return null;
            }
        } catch (error) {
            console.error(`Error retrieving data from path '${path}':`, error);
            throw error;
        }
    }

    function listenToRtdbPath(path: string,callback: (snapshot: DataSnapshot) => void): () => void {
        const dbRef: DatabaseReference = ref(db, path);

        // Attach the listener
        const unsubscribe = onValue(dbRef, (snapshot) => {
            callback(snapshot);
        }, (error) => {
            console.error(`Error listening to path '${path}':`, error);
        });

        // Return a function to easily detach the listener later
        return () => {
            unsubscribe();
            //off(dbRef,'value', unsubscribe);
            //console.log(`Listener detached for path: ${path}`);
        };
    }


    async function sendMessage(message: Omit<Message,'srcId'|'timestamp'>){
        if (!user)  return ;

        const _message: Message = {...message,srcId: user?.uid,timestamp: serverTimestamp()};
        
        async function _write(uid:string){
            const messagesRef = ref(db, `users/${uid}/messages`);
            const newPostRef = await push(messagesRef, _message);
            return newPostRef.key;
        }
        
        return {
            srcPostKey: await _write(_message.srcId), 
            dstPostKey: await _write(_message.dstId)
        };
    }

    function normalizeId(humanLikeUid:string) {
        return humanLikeUid.split('-').slice(-1)[0];
    }

    async function addContact(humanLikeUid: string){
        if (!user)  return ;

        const uid = normalizeId(humanLikeUid);

        if (!(await getProfile(uid)))   throw new Error('User doesn\'t exists on CHATTO');

        const mycontactsRef = ref(db, `users/${user.uid}/contacts`);
        const theirContactsRef = ref(db, `users/${uid}/contacts`);
        
        const newPostRef = await push(mycontactsRef, {uid,adder: user.uid});
        const newPostRef2 = await push(theirContactsRef, {uid: user.uid,adder: user.uid});

        return newPostRef.key;
    }

    async function listAllContacts() {
        return Object.values(await getDataAtPath(`users/${user?.uid}/contacts`) || {}) as any[] || [];
    }

    async function listAllMessages(){
        return Object.values(await getDataAtPath(`users/${user?.uid}/messages`) || {}) as Message[] || [];
    }

    async function getProfile(uid:string) {
        return (await getDataAtPath(`users/${uid}/info`)) as (Pick<NonNullable<typeof user>,'displayName'|'uid'|'photoURL'|'email'> | null);
    }

    function onContactsChanged(listener: (list: Awaited<ReturnType<ChatContextValue['listAllContacts']>>) => Promise<void>) {
        return listenToRtdbPath(`users/${user?.uid}/contacts`,snapshot => {
            listener(Object.values(snapshot.val() || {}));
        });
    }

    function onMessagesChanged(listener: (list: Awaited<ReturnType<ChatContextValue['listAllMessages']>>) => void) {
        return listenToRtdbPath(`users/${user?.uid}/messages`,snapshot => {
            listener(Object.values(snapshot.val() || {}));
        });
    }

    /*async function sendIsTypingSignal(dstUID:string) {
        
    }*/
    async function sendIsOnlineSignal() {
        if (!user)  return ;

        const onlineRef = ref(db, `users/${user.uid}/online`);
        
        await set(onlineRef, {timestamp: serverTimeMs.get()/*serverTimestamp()*/});
    }

    async function readIsOnlineSignal(uid:string){
        return await getDataAtPath(`users/${uid}/online`) as {timestamp:number} || {timestamp: 0};
    }

    /*function onOnlineSignal(uid:string,listener: (obj:{timestamp: number}) => void) {
        return listenToRtdbPath(`users/${uid}/online`,snapshot => {
            listener(snapshot.val() || {timestamp: -Infinity});
        });
    }*/



    return (
        <ChatContext.Provider value={{
            sendMessage,
            addContact,
            listAllContacts,
            getProfile,
            normalizeId,
            listAllMessages,
            onContactsChanged,
            onMessagesChanged,
            sendIsOnlineSignal,
            readIsOnlineSignal,
            serverTimeMs,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export default ChatContextProvider;

