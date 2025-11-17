import { type FC } from 'react';

import {
  ConversationList,
  Conversation,
  Avatar,
} from "@chatscope/chat-ui-kit-react";

interface ContactsListElementModel{
    info?: string;
    lastSenderName?: string;
    name: string;
    profileImageUrl?: string;
    //lastActivityTime?: Date;
    /*unreadCnt*/
}

interface SideContactsContainerProps extends React.ComponentPropsWithRef<'div'>{
  list: ContactsListElementModel[];
}

const SideContactsContainer: FC<SideContactsContainerProps> = ({list,...props}) => {
  return (
    <ConversationList {...props}>
        {
            list.map(d => 
                <Conversation
                  info={d.info}
                  lastSenderName={d.lastSenderName}
                  name={d.name}
                  /*lastActivityTime={d.lastActivityTime}*/
                >
                    <Avatar
                      name={d.name}
                      src={d.profileImageUrl}
                    />
                </Conversation>
            )
        }
    </ConversationList>
  );
};

export default SideContactsContainer;