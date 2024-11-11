import { forwardRef, Module } from '@nestjs/common';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SequelizeModule } from '@nestjs/sequelize';

import { MqttServerModule } from '@modules/mqttServer/mqttServer.module';
import { ChatEventModule } from '@modules/chatEvent/chatEvent.module';

import { TelegramUpdate } from './telegram.update';

import { TelegramService } from './telegram.service';
import { ChatEvent } from '@modules/chatEvent/chatEvent.entity';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { ChatModule } from '@modules/chat/chat.module';
import { ChatService } from '@modules/chat/chat.service';
import { WhatsappModule } from '@modules/whatsapp/whatsapp.module';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    SequelizeModule.forFeature([ChatEvent]),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        middlewares: [sessions.middleware()],
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
    forwardRef(() => MqttServerModule),
    forwardRef(() => ChatModule),
    forwardRef(() => WhatsappModule),
    ChatEventModule,
  ],
  providers: [
    ConfigService,
    TelegramUpdate,
    TelegramService,
    ChatService,
    ChatEventService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
