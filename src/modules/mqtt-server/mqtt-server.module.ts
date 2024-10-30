import { forwardRef, Module } from '@nestjs/common';
import { MqttServerService } from './mqtt-server.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatModule } from '@modules/chat/chat.module';
import { ChatService } from '@modules/chat/chat.service';
import { ChatEventModule } from '@modules/chat-event/chat-event.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatEvent } from '@modules/chat-event/chat-event.entity';
import { ChatEventService } from '@modules/chat-event/chat-event.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatEvent]),
    ConfigModule,
    forwardRef(() => ChatModule),
    ChatEventModule,
  ],
  providers: [ConfigService, MqttServerService, ChatService, ChatEventService],
  exports: [MqttServerService],
})
export class MqttServerModule {}
