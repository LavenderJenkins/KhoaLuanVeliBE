import { Socket } from "socket.io";

export interface ISocket extends Socket {
  user: any
}

export interface IJoinRoom {
  conversation_id: string;
}

export interface IReadMessage {
  message_id: string;
}

export interface IChatMessage {
  conversation_id: string;
  content: string;
  type: number;
}
