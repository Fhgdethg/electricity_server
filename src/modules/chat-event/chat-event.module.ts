import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { ChatEvent } from '@modules/chat-event/chat-event.entity';

import { ChatEventService } from '@modules/chat-event/chat-event.service';

@Module({
  imports: [SequelizeModule.forFeature([ChatEvent])],
  providers: [ConfigService, ChatEventService],
  exports: [ChatEventService],
})
export class ChatEventModule {}
