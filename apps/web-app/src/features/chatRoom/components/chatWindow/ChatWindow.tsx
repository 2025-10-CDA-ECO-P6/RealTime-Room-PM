import { useEffect } from "react";
import { Panel } from "../../../../core/ui";
import styles from "./ChatWindow.module.css";
import { MessageList, MessageInput } from "..";
import { useChatRoom, useUserId } from "../../hooks";
import { ConnectionStatus } from "../connectionStatus/ConnectionStatus";

export const ChatWindow: React.FC = () => {
  const chatRoom = useChatRoom();
  const userId = useUserId();

  useEffect(() => {
    if (userId && !chatRoom.isJoined) {
      chatRoom.joinRoom(userId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, chatRoom.isJoined, chatRoom.joinRoom]);

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
    <Panel title="" header={headerContent} hasBorder>
      <div className={styles.container}>
        <MessageList messages={chatRoom.messages} />
        <MessageInput onSend={chatRoom.sendMessage} isDisabled={!chatRoom.isJoined} />
      </div>
    </Panel>
  );
};
