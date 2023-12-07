import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, port: process.env.PORT || 3001 })
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayConnection {

  private logger: Logger = new Logger('AppGateway');

  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}
  afterInit(server: any) {
    this.logger.log('Initialized!');
  }
  
  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: { name: string, message: string, room: string }) {
    this.server.to(message.room).emit('chatToClient', message)
    this.logger.log(`Client connected: ${client.id} | ${message.name}: Message ${message.message} to room ${message.room}`);
  }

  @SubscribeMessage('join')
  joinRoom(@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    this.messagesService.identify(name, client.id);
    this.logger.log(this.messagesService.clientToUser);
  }

  @SubscribeMessage('typing')
  typing(@MessageBody('isTyping') isTyping: boolean, @ConnectedSocket() client: Socket) {
    const name = this.messagesService.getClientName(client.id);
    this.logger.log(`Client connected: ${client.id}: Message ${isTyping}`);
    client.broadcast.emit('typing', { name, isTyping });
  }

  @SubscribeMessage('joinRoom')
  RoomIn(client: Socket, room: string) {
    client.join(room)
    this.logger.log(`Client with ID: ${client.id} joined room [${room}]`)
    client.emit('joinedRoom', room)
  }

  @SubscribeMessage('leaveRoom')
  RoomOut(client: Socket, room: string) {
    client.leave(room)
    this.logger.log(`Client with ID: ${client.id} left room [${room}]`)
    client.emit('leftRoom', room)
  }
}
