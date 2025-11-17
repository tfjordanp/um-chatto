import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SideContactsContainer from "../components/SideContactsContainer";
import MainChatContainer from "../components/MainChatContainer";
import ChatContextProvider from "../contexts/ChatContext";


function Chat(){
    return (
        <ChatContextProvider>
            <div style={{display: "flex",justifyContent: 'left',alignItems:'stretch',height: '100%'}}>
                <SideContactsContainer list={[{name: 'Jiran',lastSenderName: 'Mark',info: 'Is the Plat ready or is it on the space ?'}]}/>
                <MainChatContainer style={{flex: 1}}/>
            </div>
        </ChatContextProvider>
    );
}

export default Chat;

