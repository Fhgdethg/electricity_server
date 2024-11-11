import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { ChatEvent } from '@modules/chatEvent/chatEvent.entity';

import { ChatEventService } from '@modules/chatEvent/chatEvent.service';

@Module({
  imports: [SequelizeModule.forFeature([ChatEvent])],
  providers: [ConfigService, ChatEventService],
  exports: [ChatEventService],
})
export class ChatEventModule {}
