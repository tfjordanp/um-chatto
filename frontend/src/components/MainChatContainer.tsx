import { useState, type FC } from 'react';

import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  InfoButton,
  Avatar,
  
} from "@chatscope/chat-ui-kit-react";

import type ContactsListElementModel from './ContactsListElementModel';

interface MainChatContainerProps extends React.ComponentPropsWithRef<'div'>{
    modelState: ReturnType<typeof useState<ContactsListElementModel>>;
}

const MainChatContainer: FC<MainChatContainerProps> = ({style,modelState:[_,setModel],...props}) => {
  return (
    <div style={{ position: "relative", height: "100%",...style}} {...props}>
        <ChatContainer>
            <ConversationHeader>
                <ConversationHeader.Back onClick={e => setModel(undefined)} />
                <Avatar
                    name="Emily"
                    src="https://chatscope.io/storybook/react/assets/emily-xzL8sDL2.svg"
                />
                <ConversationHeader.Content
                    info="Active 10 mins ago"
                    userName="Emily"
                />
                <ConversationHeader.Actions>
                    <InfoButton title="Show info" />
                </ConversationHeader.Actions>
            </ConversationHeader>
            <MessageList>
                <MessageList.Content style={{
                    display: "flex",
                    "flexDirection": "column",
                    "justifyContent": "center",
                    height: "100%",
                    textAlign: "center",
                    fontSize: "1.2em"
                    }}>
                        This is custom content placed instead of message list
                </MessageList.Content>
                <Message
                    model={{
                        message: "Hello my friend",
                        sentTime: "just now",
                        sender: "Joe",
                        direction: 'incoming',
                        position:'last'
                    }}
                />
            </MessageList>
            <MessageInput placeholder="Type message here" />
        </ChatContainer>
    </div>
  );
};

export default MainChatContainer;