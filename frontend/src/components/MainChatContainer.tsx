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

const MainChatContainer: FC<MainChatContainerProps> = ({style,modelState:[model,setModel],...props}) => {
  return (
    <div style={{ position: "relative", height: "100%",...style}} {...props}>
        <ChatContainer>
            <ConversationHeader>
                <ConversationHeader.Back onClick={e => setModel(undefined)} />
                <Avatar
                    name={model?.name}
                    src={model?.profileImageUrl}
                    status={model?.status}
                />
                <ConversationHeader.Content
                    info="Online"
                    userName={model?.name}
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
                        This chat is empty. Leave a message to begin a conversation !!
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