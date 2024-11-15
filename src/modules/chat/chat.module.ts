import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from '@modules/telegram/telegram.module';
import { MqttServerModule } from '@modules/mqttServer/mqttServer.module';
import { ChatEventModule } from '@modules/chatEvent/chatEvent.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatEvent } from '@modules/chatEvent/chatEvent.entity';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { WhatsappModule } from '@modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatEvent]),
    forwardRef(() => TelegramModule),
    forwardRef(() => WhatsappModule),
    forwardRef(() => MqttServerModule),
    ChatEventModule,
    ConfigModule,
  ],
  providers: [ConfigService, ChatService, ChatEventService],
  exports: [ChatService],
})
export class ChatModule {}
