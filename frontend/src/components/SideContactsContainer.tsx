import { useState, type FC } from 'react';

import {
  ConversationList,
  Conversation,
  Avatar,
  Search,
  Sidebar,
  
} from "@chatscope/chat-ui-kit-react";

import type ContactsListElementModel from './ContactsListElementModel';

interface SideContactsContainerProps extends React.ComponentPropsWithRef<'div'>{
  list: ContactsListElementModel[];
  modelState: ReturnType<typeof useState<ContactsListElementModel>>;
}

const SideContactsContainer: FC<SideContactsContainerProps> = ({list,modelState:[_,setModel],...props}) => {
  return (
    <Sidebar position="left">
      <Search placeholder="Search..." />
      <br/>
      <ConversationList {...props}>
          {
              list.map((d,i) => 
                  <Conversation
                    info={d.info}
                    lastSenderName={d.lastSenderName}
                    name={d.name}
                    key={i}
                    onClick={e => setModel(d)}
                    lastActivityTime={d.lastActivityTime}
                  >
                      <Avatar
                        name={d.name}
                        src={d.profileImageUrl}
                        status={d.status}
                      />
                  </Conversation>
              )
          }
      </ConversationList>
    </Sidebar>
  );
};

export default SideContactsContainer;