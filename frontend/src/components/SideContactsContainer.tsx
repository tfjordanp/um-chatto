import { useContext, useEffect, useMemo, useRef, useState, type FC } from 'react';

import {
  ConversationList,
  Conversation,
  Avatar,
  Search,
  Sidebar,
  AddUserButton,
  InfoButton,
  
} from "@chatscope/chat-ui-kit-react";

import type ContactsListElementModel from './ContactsListElementModel';
import { setIntervalImmediate, useModalState, useOnMountUnsafe } from '../hooks';
import { Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { ChatContext } from '../contexts/ChatContext';
import { AuthContext } from '../contexts/AuthContext';

import './styles.css';

interface SideContactsContainerProps extends React.ComponentPropsWithRef<'div'>{
  list: ContactsListElementModel[];
  modelState: ReturnType<typeof useState<ContactsListElementModel>>;
}

const SideContactsContainer: FC<SideContactsContainerProps> = ({list,modelState:[model,setModel],...props}) => {

  const modalState = useModalState(false);
  const infoModalState = useModalState(false);
  const toastState = useModalState(false);
  const toastState2 = useModalState(false);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  const chat = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const [ humanContacts, setHumanContacts ] = useState<ContactsListElementModel[]>([]);
  const mergedList = useMemo(() => humanContacts.concat(list),[list,humanContacts]);

  useOnMountUnsafe(()=>{
    return chat?.onContactsChanged(async list => {
      setHumanContacts(await Promise.all(list.map(async ({uid}) => {
        const profile = await chat?.getProfile(uid);
        const messages = (await chat?.listAllMessages())
        .filter(m => m.srcId === uid || m.dstId === uid)
        .toSorted((m1,m2) => +m1.timestamp - +m2.timestamp);
        
        const lastSenderName =  messages.length
        ? (messages.slice(-1)[0].srcId === user?.uid ? user.displayName : profile?.displayName) || ''
        : undefined;

        const info =  messages.length
        ? (messages.slice(-1)[0].text)
        : undefined;

        const model:ContactsListElementModel = {
          'isBot': false,
          'name': profile?.displayName || '',
          'profileImageUrl': profile?.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${profile?.displayName?.replaceAll(/\s*/g,'')}`,
          lastSenderName,
          info, 
          uid,
        }
        return model;
      })));
      console.log('CONTACTS CHANGED COMPLETE');
    });
  });

  useEffect(() => {
    (async () =>
    setHumanContacts(await Promise.all(humanContacts.map(async c => {
      if (c.uid === model?.uid)   return {...c,unreadCnt:0};
      return {...c};
    }))))();
  },[model]);

  useEffect(()=>{
      return chat?.onMessagesChanged(async list => {
          //console.log(list,model?.uid);
          setHumanContacts(humanContacts => {
            (async () => 
              setHumanContacts(
                await Promise.all(humanContacts.map(async c => {
                  const uid = c.uid;
                  if (!uid)   return {...c};

                  const profile = {displayName: c.name};

                  const messages = list
                  .filter(m => m.srcId === uid || m.dstId === uid)
                  .toSorted((m1,m2) => +m1.timestamp - +m2.timestamp);

                  const lastSeen = await chat?.readHasSeenSignal(uid);
                  let unread = 0;
                  for (const m of messages){
                    if (Number(m.timestamp) > (lastSeen?.timestamp||0))   ++unread;
                  }

                  const currentModel = await new Promise<ContactsListElementModel | undefined>((resolve) => {
                    setModel(model => {
                      resolve(model);
                      return model;
                    });
                  });

                  if (currentModel?.uid === uid){
                    unread = 0;
                  }

                  const lastSenderName =  messages.length
                  ? (messages.slice(-1)[0].srcId === user?.uid ? user.displayName : profile?.displayName) || ''
                  : undefined;

                  const info =  messages.length
                  ? (messages.slice(-1)[0].text)
                  : undefined;
                  console.log('MESSAGES CHANGED COMPLETE');
                  return {...c,lastSenderName,info,unreadCnt: unread};
                }))
            ))();

            return humanContacts;
          })
      });
  },[]);

  useOnMountUnsafe(() => {
      const id = setInterval(async ()=>{
          await chat?.sendIsOnlineSignal();
          //console.log('Is online signal sent');
      },5000);
      return () => clearInterval(id);
  });

  useOnMountUnsafe(() => {
    //Check Online Status

    const id = setInterval(() => {
      setHumanContacts(humanContacts => {
        (async () =>{
          if (!chat)  return ;
          setHumanContacts(await Promise.all(humanContacts.map(
            async c=>{
              const diff = chat.serverTimeMs.get() - (await chat.readIsOnlineSignal(c.uid||''))?.timestamp;
              //console.log('DIFF',c.name,diff);
              //console.log(c.name,new Date(chat.serverTimeMs.get()),new Date((await chat.readIsOnlineSignal(c.uid||''))?.timestamp));
              
              const status:NonNullable<typeof c.status> = diff > 5*60*1000 ? 'unavailable' : (diff <= 10*1000 ? 'available' : 'away');
              return {...c,status};
            }
          )));
          setHumanContacts(humanContacts => {
            setModel(d => humanContacts.find(c=>c.uid===d?.uid));
            return humanContacts;
          });
        })();
        return humanContacts;
      });
    },7500);
    return () => clearInterval(id);
  });

  return (
    <Sidebar position="left">
      <div style={{width: '100%',display: 'flex',justifyContent: 'space-around',alignItems: 'stretch',padding:'1rem 1rem'}}>
        <AddUserButton border onClick={() => {
          modalState.setShow(true);
        }}></AddUserButton>
        <InfoButton border onClick={() => infoModalState.setShow(true)}/>
        <Search placeholder="Search..." style={{flex: 1}} />
      </div>
      <br/>
      <ConversationList {...props}>
          {
              mergedList.map((d,i) => 
                  <Conversation
                    info={d.info}
                    lastSenderName={d.lastSenderName}
                    name={d.name}
                    key={i}
                    onClick={e => setModel(d)}
                    className={d.uid === model?.uid ? 'conversation selected' : ''}
                    lastActivityTime={d.lastActivityTime}
                    unreadCnt={d.unreadCnt}
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

      <Modal show={modalState.show} onHide={modalState.handleClose} centered>
        <ToastContainer className="p-3" style={{ zIndex: 1 }} position='top-center'>
            <Toast bg='warning' onClose={toastState.handleClose} show={toastState.show} delay={3000} autohide>
              <Toast.Header>
                <strong className="me-auto">ChattoChecker</strong>
                <small>Now</small>
              </Toast.Header>
              <Toast.Body>Contact "{inputElementRef.current?.value}" already exists in your chat list !!</Toast.Body>
            </Toast>
        </ToastContainer>
        <ToastContainer className="p-3" style={{ zIndex: 1 }} position='top-center'>
            <Toast bg='danger' onClose={toastState2.handleClose} show={toastState2.show} delay={6000} autohide>
              <Toast.Header>
                <strong className="me-auto">ChattoChecker</strong>
                <small>Now</small>
              </Toast.Header>
              <Toast.Body>
                Contact "{inputElementRef.current?.value}" is not on CHATTO
                <br/>
                Make sure the id you entered was correctly copied or written !!!
              </Toast.Body>
            </Toast>
        </ToastContainer>

        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Label>User ID</Form.Label>
            <Form.Control type="text" placeholder="Enter the new user's id" ref={inputElementRef} required/>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={async () => {
              const id = chat?.normalizeId(inputElementRef.current?.value || '') || '';
              //console.log(await chat?.listAllContacts());
              
              if (id === user?.uid){    //Yourself
                toastState.setShow(true);
                return ;
              }
              
              const alreadyFound = (await chat?.listAllContacts())?.find(({uid})=>uid === id);
              if (alreadyFound){
                toastState.setShow(true);
                return ;
              }

              try{
                await chat?.addContact(id);   //if its invalid ??
                modalState.handleClose();
              }
              catch(err){
                toastState2.setShow(true);
              }
              
            }}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={infoModalState.show} onHide={infoModalState.handleClose} centered style={{userSelect: 'none'}}>
        <Modal.Header closeButton>
          <Modal.Title>My Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Copy Button for User ID ?? */}
            <table>
              <tr>
                <td><b>My ID: </b></td>
                <td style={{userSelect: 'all'}}><i style={{textDecoration: 'underline'}}>{`${user?.displayName?.toLowerCase().replaceAll(/\s*/g,'')}-${user?.uid}`}</i></td>
              </tr>
              <tr>
                <td><b>My Display Name: </b></td>
                <td>{user?.displayName}</td>
              </tr>
            </table>
            
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={infoModalState.handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </Sidebar>
  );
};

export default SideContactsContainer;