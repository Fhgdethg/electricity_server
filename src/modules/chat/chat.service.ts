import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '@modules/telegram/telegram.service';
import { MqttServerService } from '@modules/mqttServer/mqttServer.service';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { WhatsappService } from '@modules/whatsapp/whatsapp.service';
import { chatRoutes, helpText, startText } from '@modules/chat/chat.constants';

@Injectable()
export class ChatService {
  public readonly messengers: string[] = [];

  constructor(
    private readonly configService: ConfigService,
    @Inject(ChatEventService)
    private readonly chatEventService: ChatEventService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramChatService: TelegramService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappChatService: WhatsappService,
    @Inject(forwardRef(() => MqttServerService))
    private readonly mqttServerService: MqttServerService,
  ) {
    this.messengers = this.configService.get<string>('MESSENGERS').split('|');
  }

  private readonly messageSenders = {
    telegram: this.telegramChatService.sendMessageToTelegram.bind(
      this.telegramChatService,
    ),
    whatsapp: this.whatsappChatService.sendMessageToWhatsapp.bind(
      this.whatsappChatService,
    ),
  };

  private readonly senderIDs = {
    telegram: this.telegramChatService.getTelegramChatID(),
    whatsapp: this.whatsappChatService.getWhatsappChatID(),
  };

  getCurrentActiveChatID(chatID: string, botID: string) {
    let currentChatID = '';

    if (!chatID && botID) currentChatID = botID;
    else if (chatID && !botID) currentChatID = chatID;
    else if (chatID && botID) currentChatID = chatID;

    return currentChatID;
  }

  public sendMsgToSomeMessengers = (messengers: string[], data: string) => {
    messengers.forEach((messenger) => {
      this.messageSenders[messenger](data, this.senderIDs[messenger]);
    });
  };

  public sendMsgToCurrentMessenger = (messenger: string, data: string) => {
    this.messageSenders[messenger](data, this.senderIDs[messenger]);
  };

  async router(command: string, senderID: string, messenger: string) {
    const regex = /^\/(\d{1,2})-(\d{1,2})$/;
    const match = command.match(regex);

    if (command === chatRoutes.start) {
      this.sendMsgToCurrentMessenger(messenger, startText);
    } else if (command === chatRoutes.help)
      this.sendMsgToCurrentMessenger(messenger, helpText);
    else if (command === chatRoutes.history) {
      const history = await this.chatEventService.getParsedHistoryStr();
      this.sendMsgToCurrentMessenger(messenger, history);
    } else if (command === chatRoutes.historyYesterday) {
      const history =
        await this.chatEventService.getParsedYesterdayHistoryStr();
      this.sendMsgToCurrentMessenger(messenger, history);
    } else if (command === chatRoutes.historyClear) {
      await this.chatEventService.clearChatEvents();
      this.sendMsgToSomeMessengers(
        this.messengers,
        'Історію подій було очищено',
      );
    } else if (command === chatRoutes.on) {
      this.mqttServerService.stopWorkSchedule();
      this.mqttServerService.chModeMqttServer('on', this.senderIDs[messenger]);
    } else if (command === chatRoutes.off) {
      this.mqttServerService.stopWorkSchedule();
      this.mqttServerService.chModeMqttServer('off', this.senderIDs[messenger]);
    } else if (match) {
      const hoursOn = parseInt(match[1], 10);
      const hoursOff = parseInt(match[2], 10);

      if (
        hoursOn > 0 &&
        hoursOn < 24 &&
        hoursOff > 0 &&
        hoursOff < 24 &&
        hoursOn + hoursOff === 24
      ) {
        this.mqttServerService.startWorkSchedule(hoursOn, hoursOff, senderID);
      }
    }
  }
}
