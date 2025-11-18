import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SideContactsContainer from "../components/SideContactsContainer";
import MainChatContainer from "../components/MainChatContainer";
import ChatContextProvider from "../contexts/ChatContext";
import { useState } from "react";

import { MainContainer } from "@chatscope/chat-ui-kit-react";

import type ContactsListElementModel from '../components/ContactsListElementModel';

const list:ContactsListElementModel[]  = [
    {
        name: 'Calculetta',
        lastSenderName: 'Calculetta',
        info: `
        Hi, do you need to solve a mathematical expression ?\n
        Just text me and i'll provide you with the answer in seconds.
        `,
        isBot: true,
        status: 'available',
        profileImageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Liliana"
    },
    {
        name: 'Listenr',
        lastSenderName: 'Listenr',
        info: `
        Hey there user, i'm commonly known as the listener bot\n
        My job is simple, you text me, i read all your messages and i stay silent.\n
        I'm always online 24/24, 7/7.
        Text me !!!
        `,
        isBot: true,
        status: 'available',
        profileImageUrl: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sawyer"
    },
    {
        name: 'Parrot',
        lastSenderName: 'Parrot',
        info: `
        ARGHHHH !!!
        I'm sorry for the unusual tone. My name is parrot.\n
        I excel at reading text with my voice.
        Leave a message !!!
        `,
        isBot: true,
        status: 'available',
        profileImageUrl: "https://api.dicebear.com/9.x/micah/svg?seed=Kimberly"
    },
];

function Chat(){
    const modelState = useState<ContactsListElementModel | undefined>();
    return (
        <ChatContextProvider>
            <MainContainer responsive>
                <SideContactsContainer modelState={modelState} list={list}/>
                <MainChatContainer modelState={modelState} style={{flex: 1}}/>
            </MainContainer>
        </ChatContextProvider>
    );
}

export default Chat;

