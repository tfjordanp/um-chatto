import type { UserStatus } from "@chatscope/chat-ui-kit-react";

export default interface ContactsListElementModel{
    info?: string;
    lastSenderName?: string;
    name: string;
    profileImageUrl?: string;
    isBot?: boolean;
    lastActivityTime?: string;
    status?: UserStatus;
    uid?: string;
    //lastActivityTime?: Date;
    unreadCnt?: number;
}
