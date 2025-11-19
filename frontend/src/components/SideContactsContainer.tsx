import { useContext, useRef, useState, type FC } from 'react';

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
import { useModalState } from '../hooks';
import { Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { ChatContext } from '../contexts/ChatContext';
import { AuthContext } from '../contexts/AuthContext';

interface SideContactsContainerProps extends React.ComponentPropsWithRef<'div'>{
  list: ContactsListElementModel[];
  modelState: ReturnType<typeof useState<ContactsListElementModel>>;
}

const SideContactsContainer: FC<SideContactsContainerProps> = ({list,modelState:[_,setModel],...props}) => {

  const modalState = useModalState(false);
  const infoModalState = useModalState(false);
  const toastState = useModalState(false);
  const toastState2 = useModalState(false);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  const chat = useContext(ChatContext);
  const { user } = useContext(AuthContext);

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