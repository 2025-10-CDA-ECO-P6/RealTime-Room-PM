export type JoinRoomHandler = (roomId: string, userId: string, userName: string) => { roomLink: string } | void;
export type LeaveRoomHandler = (roomId: string, userId: string, userName: string) => void;
export type MessageHandler = (roomId: string, data: { userId: string; userName: string; content: string }) => void;

