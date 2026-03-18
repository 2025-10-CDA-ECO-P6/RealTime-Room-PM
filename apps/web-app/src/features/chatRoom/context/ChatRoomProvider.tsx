import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { ChatRoomContext } from "./ChatRoomContext";
import { loggerService } from "../../../core/services/Loggerservice";
import { type Message, initialState } from "../types";
import { chatRoomReducer } from "./chatRoomReducer";
import { getSocketService, initSocketService } from "../services";

interface ChatRoomProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export const ChatRoomProvider: React.FC<ChatRoomProviderProps> = ({ children, roomId }) => {
  const [state, dispatch] = useReducer(chatRoomReducer, {
    ...initialState,
    roomId,
  });

  const stateRef = useRef(state);
  const currentUserIdRef = useRef<string | null>(null);
  const pendingJoinUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const sendMessage = useCallback((content: string) => {
    const currentState = stateRef.current;
    const currentUserId = currentUserIdRef.current;

    if (!currentState.isJoined || !currentUserId || !content.trim()) {
      loggerService.warn("ChatRoom", "Cannot send message: user not joined or content empty");
      return;
    }

    getSocketService().sendMessage(currentState.roomId, currentUserId, content);
  }, []);

  const joinRoom = useCallback((userId: string) => {
    const socketService = getSocketService();
    const currentState = stateRef.current;

    pendingJoinUserIdRef.current = userId;
    currentUserIdRef.current = userId;

    if (!socketService.isConnected()) {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connecting" });
      return;
    }

    socketService.joinRoom(currentState.roomId, userId);
  }, []);

  const leaveRoom = useCallback(() => {
    const socketService = getSocketService();

    socketService.leaveRoom();
    pendingJoinUserIdRef.current = null;
    currentUserIdRef.current = null;

    dispatch({ type: "SET_IS_JOINED", payload: false });
    dispatch({ type: "SET_CONNECTION_STATUS", payload: "disconnected" });
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  useEffect(() => {
    const socketService = initSocketService();

    const handleConnect = () => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connected" });

      const pendingUserId = pendingJoinUserIdRef.current;
      const currentState = stateRef.current;

      if (pendingUserId && !currentState.isJoined) {
        socketService.joinRoom(currentState.roomId, pendingUserId);
      }
    };

    const handleDisconnect = (reason: string) => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "disconnected" });
      dispatch({ type: "SET_IS_JOINED", payload: false });
      loggerService.warn("ChatRoom", "Socket disconnected", { reason });
    };

    const handleError = (error: unknown): void => {
      const errorMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : error !== null && typeof error === "object"
              ? JSON.stringify(error)
              : "Unknown error";

      dispatch({ type: "SET_ERROR", payload: errorMsg });
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "error" });
    };

    const handleMessageReceived = (data: { userId: string; content: string }) => {
      const message: Message = {
        id: crypto.randomUUID(),
        userId: data.userId,
        content: data.content,
        timestamp: Date.now(),
        type: "user",
      };

      dispatch({ type: "ADD_MESSAGE", payload: message });
    };

    const handleRoomJoined = (data: { roomId: string; userId: string; userCount: number; roomLink: string }) => {
      currentUserIdRef.current = data.userId;
      pendingJoinUserIdRef.current = null;

      dispatch({ type: "SET_IS_JOINED", payload: true });
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "connected" });
      dispatch({ type: "SET_ERROR", payload: null });
    };

    const handleUserJoined = (data: { userId: string; userCount: number }) => {
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        userId: "system",
        content: `${data.userId} a rejoint la salle`,
        timestamp: Date.now(),
        type: "system",
      };

      dispatch({ type: "ADD_MESSAGE", payload: systemMessage });
    };

    const handleUserLeft = (data: { userId: string; userCount: number }) => {
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        userId: "system",
        content: `${data.userId} a quitté la salle`,
        timestamp: Date.now(),
        type: "system",
      };

      dispatch({ type: "ADD_MESSAGE", payload: systemMessage });
    };

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onError(handleError);
    socketService.onMessageReceived(handleMessageReceived);
    socketService.onRoomJoined(handleRoomJoined);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);

    socketService.connect().catch((error) => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: "error" });
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : String(error) });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({
      roomId: state.roomId,
      room: state.room,
      messages: state.messages,
      connectionStatus: state.connectionStatus,
      isJoined: state.isJoined,
      error: state.error,
      sendMessage,
      joinRoom,
      leaveRoom,
    }),
    [
      state.roomId,
      state.room,
      state.messages,
      state.connectionStatus,
      state.isJoined,
      state.error,
      sendMessage,
      joinRoom,
      leaveRoom,
    ],
  );

  return <ChatRoomContext.Provider value={value}>{children}</ChatRoomContext.Provider>;
};
