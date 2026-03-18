import { useContext } from "react";
import { ChatRoomContext } from "../context/ChatRoomContext";

export function useChatRoom() {
  const context = useContext(ChatRoomContext);

  if (!context) {
    throw new Error("useChatRoom must be used within a ChatRoomProvider");
  }

  return context;
}
