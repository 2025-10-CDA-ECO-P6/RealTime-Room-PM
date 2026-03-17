export type MessageHandler = (roomId: string, data: { userId: string; content: string }) => void;
export type JoinRoomHandler = (roomId: string, userId: string) => { roomLink: string } | null;
export type LeaveRoomHandler = (roomId: string, userId: string) => void;
