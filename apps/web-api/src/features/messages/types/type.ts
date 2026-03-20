export type JoinRoomPayload = {
  roomId: string;
  userId: string;
  userName: string;
};

export type SendMessagePayload = {
  content: string;
};
