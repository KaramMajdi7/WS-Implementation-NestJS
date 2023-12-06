import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
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

  // @SubscribeMessage('createMessage')
  // async create(@MessageBody() createMessageDto: CreateMessageDto) {
  //   const message = await this.messagesService.create(createMessageDto);

  //   this.server.emit('message', message);
  //   this.logger.log(`Client sent a message: ${message.text}`);
  //   this.server.emit('messages', this.messagesService.findAll());
  //   return message;
  // }

  
  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: { name: string, message: string }) {
    this.server.emit('chatToClient', message)
    this.logger.log(`Client connected: ${client.id} | ${message.name}: Message ${message.message}`);
  }

  // @SubscribeMessage('findAllMessages')
  // findAll() {
  //   this.server.emit('messages', this.messagesService.findAll()); 
  //   return this.messagesService.findAll();
  // }

  @SubscribeMessage('join')
  joinRoom(@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    // this.logger.log(`Client connected: ${client.id}: Message ${name}`);
    this.messagesService.identify(name, client.id);
    this.logger.log(this.messagesService.clientToUser);
  }

  @SubscribeMessage('typing')
  typing(@MessageBody('isTyping') isTyping: boolean, @ConnectedSocket() client: Socket) {
    const name = this.messagesService.getClientName(client.id);
    this.logger.log(`Client connected: ${client.id}: Message ${isTyping}`);
    client.broadcast.emit('typing', { name, isTyping });
  }
}
