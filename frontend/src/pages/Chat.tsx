import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SideContactsContainer from "../components/SideContactsContainer";
import MainChatContainer from "../components/MainChatContainer";


function Chat(){
    
    return (
        <div style={{display: "flex",justifyContent: 'left',alignItems:'stretch',height: '100%'}}>
            <SideContactsContainer list={[{name: 'Jiran',lastSenderName: 'Mark',info: 'Is the Plat ready or is it on the space ?'}]}/>
            <MainChatContainer style={{flex: 1}}/>
        </div>
    );
}

export default Chat;

