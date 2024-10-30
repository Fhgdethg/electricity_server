import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Repository } from 'sequelize-typescript';

import { ChatEvent } from '@modules/chat-event/chat-event.entity';

import { IChatEvent } from '@modules/chat-event/chat-event.types';
import { getCurrentDateAsTimeString } from '@helpers/time';

@Injectable()
export class ChatEventService {
  constructor(
    @InjectModel(ChatEvent)
    private readonly chatEventRepository: Repository<ChatEvent>,
  ) {}

  async getYesterdayEvents() {
    const today = new Date();
    const startOfYesterday = new Date(today);
    const endOfYesterday = new Date(today);

    startOfYesterday.setDate(today.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    endOfYesterday.setDate(today.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const events: ChatEvent[] = await this.chatEventRepository.findAll({
      where: {
        eventDate: {
          [Op.between]: [startOfYesterday, endOfYesterday],
        },
      },
    });

    return events || [];
  }

  parseEventsToString(events: IChatEvent[]) {
    let historyStr: string = '';

    events.forEach(
      (history) =>
        (historyStr += `${history.action} о ${history.eventDate}\n\n`),
    );

    return historyStr || 'Вчора не було подій';
  }

  async getParsedHistoryStr() {
    const events = await this.getYesterdayEvents();
    return this.parseEventsToString(events);
  }

  async addChatEvent(action: string) {
    await this.chatEventRepository.create({
      action,
      eventDate: new Date(),
    });
  }
}
