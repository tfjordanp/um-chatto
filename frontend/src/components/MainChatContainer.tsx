import { useContext, useEffect, useState, type FC } from 'react';

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
import {ChatContext} from '../contexts/ChatContext';
import {AuthContext} from '../contexts/AuthContext';
import { useOnMountUnsafe } from '../hooks';

interface MainChatContainerProps extends React.ComponentPropsWithRef<'div'>{
    modelState: ReturnType<typeof useState<ContactsListElementModel>>;
}

const MainChatContainer: FC<MainChatContainerProps> = ({style,modelState:[model,setModel],...props}) => {
  const chat = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  
  const [ messages, setMessages ] = useState<Awaited<ReturnType<Exclude<typeof chat,null>['listAllMessages']>>>([]);

  useEffect(()=>{
        return chat?.onMessagesChanged(async list => {
            //console.log(list,model?.uid);
            setMessages(list
                .filter(m => m.dstId===model?.uid || m.srcId===model?.uid)
                .toSorted((m1,m2) => +m1.timestamp - +m2.timestamp)
            );
        });
    },[model?.uid]);

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
                    info={model?.status=='available' ? 'Online' : 'Offline'}
                    userName={model?.name}
                />
                <ConversationHeader.Actions>
                    <InfoButton title="Show info" />
                </ConversationHeader.Actions>
            </ConversationHeader>
            <MessageList>
                {
                    messages.length === 0 ?
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
                    : messages.map((m,i) => 
                    <Message
                        key={i}
                        model={{
                            message: m.text,
                            sentTime: "just now",
                            sender: (m.srcId===user?.uid ? user.displayName : model?.name) || '',
                            direction: (m.srcId===user?.uid ? 'outgoing' : 'incoming'),
                            position: 'last'
                        }}
                    >
                        <Avatar
                            name={(m.srcId===user?.uid ? user.displayName : model?.name) || ''}
                            src={m.srcId===user?.uid ? `https://api.dicebear.com/9.x/initials/svg?seed=${user?.displayName?.replaceAll(/\s*/g,'')}` : model?.profileImageUrl}
                            size='sm'
                        />
                    </Message>)
                }
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={message => {
                chat?.sendMessage({'dstId': model?.uid || '','text': message});
            }} />
        </ChatContainer>
    </div>
  );
};

export default MainChatContainer;