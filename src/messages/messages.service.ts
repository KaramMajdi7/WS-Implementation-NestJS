import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {

  private logger: Logger = new Logger('AppGateway');

  messages: Message[] = [{ name: 'John', text: 'hello' }, { name: 'Doe', text: 'world' }];
  clientToUser = {};

  identify(name : string, clientId: string){
    this.clientToUser[clientId] = name;

    return Object.values(this.clientToUser);
  }

  getClientName(clientId: string){
    return this.clientToUser[clientId];
  }

  create(createMessageDto: CreateMessageDto) {
    const message = { ...createMessageDto };
    this.messages.push(message);

    return message;
  }

  findAll() {
    this.logger.log(this.messages);
    return this.messages;
  }
}
