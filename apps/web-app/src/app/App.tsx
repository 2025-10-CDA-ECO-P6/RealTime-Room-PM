import "./App.css";
import { ChatRoomProvider } from "../features/chatRoom/context/ChatRoomProvider";
import { useRoomIdFromUrl } from "../features/chatRoom/hooks/useRoomIdFromUrl";
import { RpgProvider } from "../features/rpg/context/RpgProvider";
import { GameChatShell } from "./components/gameChatShell/GameChatShell";

import styles from "./App.module.css";

function AppContent() {
  return (
    <div className={styles.app}>
      <RpgProvider>
        <GameChatShell />
      </RpgProvider>
    </div>
  );
}

export default function App() {
  const roomId = useRoomIdFromUrl();

  return (
    <ChatRoomProvider roomId={roomId}>
      <AppContent />
    </ChatRoomProvider>
  );
}
