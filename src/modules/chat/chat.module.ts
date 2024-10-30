import { forwardRef, Module } from '@nestjs/common';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SequelizeModule } from '@nestjs/sequelize';

import { MqttServerModule } from '@modules/mqtt-server/mqtt-server.module';
import { ChatEventModule } from '@modules/chat-event/chat-event.module';

import { ChatUpdate } from './chat.update';

import { ChatService } from './chat.service';
import { ChatEvent } from '@modules/chat-event/chat-event.entity';
import { ChatEventService } from '@modules/chat-event/chat-event.service';

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
    ChatEventModule,
  ],
  providers: [ConfigService, ChatUpdate, ChatService, ChatEventService],
  exports: [ChatService],
})
export class ChatModule {}
