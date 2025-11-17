import { type FC } from 'react';

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  InfoButton,
  Avatar,
  
} from "@chatscope/chat-ui-kit-react";

interface MainChatContainerProps extends React.ComponentPropsWithRef<'div'>{
  
}

const MainChatContainer: FC<MainChatContainerProps> = ({style,...props}) => {
  return (
    <div style={{ position: "relative", height: "100%",...style}} {...props}>
        <MainContainer>
            <ChatContainer>
                <ConversationHeader>
                    <ConversationHeader.Back />
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
        </MainContainer>
    </div>
  );
};

export default MainChatContainer;