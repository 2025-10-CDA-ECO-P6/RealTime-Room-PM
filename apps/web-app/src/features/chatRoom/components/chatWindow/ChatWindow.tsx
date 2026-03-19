import { useEffect } from "react";
import { Panel } from "../../../../core/ui";
import styles from "./ChatWindow.module.css";
import { MessageList, MessageInput } from "..";
import { useChatRoom } from "../../hooks";
import { ConnectionStatus } from "../connectionStatus/ConnectionStatus";
import { useCurrentUser } from "../../../common/hooks";

export const ChatWindow: React.FC = () => {
  const chatRoom = useChatRoom();
  const { userId, userName } = useCurrentUser();

  useEffect(() => {
    if (userId && userName && !chatRoom.isJoined) {
      chatRoom.joinRoom({ userId, userName });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, chatRoom.isJoined, chatRoom.joinRoom]);

  const headerContent = (
    <div className={styles.header}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>Discussion</span>
        <span className={styles.subtitle}>Conversation en direct</span>
      </div>
      <ConnectionStatus status={chatRoom.connectionStatus} />
    </div>
  );

  return (
    <Panel header={headerContent} hasBorder>
      <div className={styles.container}>
        <MessageList messages={chatRoom.messages} currentUserId={userId} />
        <MessageInput onSend={chatRoom.sendMessage} isDisabled={!chatRoom.isJoined} />
      </div>
    </Panel>
  );
};