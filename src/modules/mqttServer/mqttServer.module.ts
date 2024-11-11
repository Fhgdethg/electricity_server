import { forwardRef, Module } from '@nestjs/common';
import { MqttServerService } from './mqttServer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from '@modules/telegram/telegram.module';
import { TelegramService } from '@modules/telegram/telegram.service';
import { ChatEventModule } from '@modules/chatEvent/chatEvent.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatEvent } from '@modules/chatEvent/chatEvent.entity';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatEvent]),
    ConfigModule,
    forwardRef(() => TelegramModule),
    forwardRef(() => ChatModule),
    ChatEventModule,
  ],
  providers: [
    ConfigService,
    MqttServerService,
    TelegramService,
    ChatEventService,
  ],
  exports: [MqttServerService],
})
export class MqttServerModule {}
