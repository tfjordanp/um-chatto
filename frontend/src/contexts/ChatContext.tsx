import { createContext, useContext, useState, type JSX } from "react";
import type React from "react";

import { getDatabase, ref, push, set, serverTimestamp, onValue } from "firebase/database";
import { useOnMountUnsafe } from "../hooks";
import { AuthContext } from "./AuthContext";

interface ChatContextValue{
    sendMessage: (message: Omit<Message,'srcId'|'timestamp'>) => Promise<any>;
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

    /*async function sendIsTypingSignal(dstUID:string) {
        
    }*/



    return (
        <ChatContext.Provider value={{sendMessage}}>
            {children}
        </ChatContext.Provider>
    );
}

export default ChatContextProvider;

