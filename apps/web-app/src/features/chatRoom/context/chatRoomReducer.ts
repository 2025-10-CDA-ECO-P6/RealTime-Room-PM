import { initialState, type ChatRoomAction, type ChatRoomState } from "../types";

export function chatRoomReducer(state: ChatRoomState, action: ChatRoomAction): ChatRoomState {
  switch (action.type) {
    case "SET_ROOM_ID":
      return { ...state, roomId: action.payload };

    case "SET_ROOM":
      return { ...state, room: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };

    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.payload };

    case "SET_IS_JOINED":
      return { ...state, isJoined: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
