import {Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Server} from 'socket.io';
import {RedisConnectionService} from 'src/redis-connection/redis-connection.service';
import {IChatMessage, IJoinRoom, IReadMessage, ISocket} from './constants';
import {SocketService} from './socket.service';

@WebSocketGateway({
  cors: {origin: '*'},
  namespace: 'socket',
  transports: ['websocket', 'polling'],
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly socketService: SocketService,
    private readonly redisService: RedisConnectionService,
  ) {}
  logger = new Logger('SocketServer');
  @WebSocketServer() server: Server;


  async handleConnection(client: ISocket) {
    try {
      this.logger.log(`${client.id} :::>> connected`);

      const token = client.handshake.headers.authorization;
      const jwt = new JwtService();
      const user: any = jwt.decode(token);
      this.logger.log(`Có người dùng kết nối mới >>  ${JSON.stringify(user, null, 1)}`);
      client.user = user;

      await this.redisService.addOnlineUser(user.userId);

    } catch (error) {
      this.logger.error(`${client.id} Có lỗi khi kết nối tới server: ${error}`)
      client.disconnect();
    }
  }

  handleDisconnect(client: ISocket) {
    this.logger.log(`${client.id} <<::: disconnected`);

    const token = client.handshake.headers.authorization;
    const jwt = new JwtService();
    const user: any = jwt.decode(token);

    this.logger.log(`Có người dùng ngắt kết nối mới >>  ${JSON.stringify(user, null, 1)}`);
    this.redisService.removeUserOnline(user.userId);
  };

  afterInit(server: Server) {
    global._server = this.server;
    this.logger.log('ISocket server initialized!')
  }

  @SubscribeMessage('join-room')
  async joinRoom(client: ISocket, data: IJoinRoom) {
    const user = client.user;
    await this.redisService.joinRoom(user.userId, data.conversation_id);
    client.join(data.conversation_id);
    // await this.socketService.joinRoom(user.user_id, data.conversation_id);
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(client: ISocket, data: IJoinRoom) {
    const user = client.user;
    await this.redisService.leaveRoom(user.userId);
    // client.leave(data.conversation_id);    
  }

  @SubscribeMessage('chat-message')
  async chatting(client: ISocket, data: IChatMessage) {
    try {
      console.log(`File: src/socket/socket.gateway.ts - Line: 83: `, data)
      const rooms = [...client.rooms];
      const user = client.user;
      const {conversation_id: conversationId, content, type} = data;

      const message = await this.socketService.sendChatMessage(user.userId, conversationId, content, type)
      client.broadcast.to(conversationId).emit('chat-message', message)
    } catch (e) {
      this.logger.error(e)
    }
  }

  @SubscribeMessage("read-message")
  async readMessage(client: ISocket, data: IReadMessage) {
    try {
    } catch (e) {

    }
  }
}
