import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MqttServerService } from '@modules/mqtt-server/mqtt-server.service';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { telegramRoutes } from '@constants/telegramRoutes';
import { ChatEventService } from '@modules/chat-event/chat-event.service';

@Injectable()
export class ChatService {
  readonly startText =
    'Доброго дня , Александрович Даник\n' +
    'Це система контролю електроенергії. \n' +
    'Введіть "/help" для отримання даних про функціонал додатку';
  readonly helpText =
    '/on - це маршрут для включення електроенергії без графіка відключення; \n' +
    '/off - це маршрут для виключення електроенергії без графіка відключення; \n' +
    '/[00]-[00] - це шаблонний маршрут для змини графіку відключень електроенергії.Кожне число позначає кількість годин. Перше число відповідає за кількість годин, в які є електрика,а друге - на період часу, коли вона буде відключеною. Час встановлюється на добу, тому сума чисел повинна дорівнювати 24 і жодне з них не повинно дорівнювати 0.Приклади правильного маршруту: /12-12, /9-15, /16-8.';

  private readonly telegramChatID: string;
  private readonly yourTelegramChatID: string;

  constructor(
    @Inject(forwardRef(() => MqttServerService))
    private readonly mqttServerService: MqttServerService,
    @Inject(ChatEventService)
    private readonly chatEventService: ChatEventService,
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
  ) {
    this.telegramChatID = this.configService.get<string>('TELEGRAM_CHAT_ID');
    this.yourTelegramChatID = this.configService.get<string>(
      'YOUR_TELEGRAM_CHAT_ID',
    );
  }

  getCurrentActiveChatID() {
    let currentChatID = '';

    if (!this.telegramChatID && this.yourTelegramChatID)
      currentChatID = this.yourTelegramChatID;
    else if (this.telegramChatID && !this.yourTelegramChatID)
      currentChatID = this.telegramChatID;
    else if (this.telegramChatID && this.yourTelegramChatID)
      currentChatID = this.telegramChatID;

    return currentChatID;
  }

  async router(command: string, senderID: string) {
    const regex = /^\/(\d{1,2})-(\d{1,2})$/;
    const match = command.match(regex);

    if (command === telegramRoutes.start)
      this.sendMessageToChat(this.startText, senderID);
    else if (command === telegramRoutes.help)
      this.sendMessageToChat(this.helpText, senderID);
    else if (command === telegramRoutes.history) {
      const history = await this.chatEventService.getParsedHistoryStr();
      this.sendMessageToChat(history, senderID);
    } else if (command === telegramRoutes.on) {
      this.mqttServerService.stopWorkSchedule();
      this.mqttServerService.chModeMqttServer('on', senderID);
    } else if (command === telegramRoutes.off) {
      this.mqttServerService.stopWorkSchedule();
      this.mqttServerService.chModeMqttServer('off', senderID);
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

  sendMessageToChat(message: string, senderID) {
    this.bot.telegram.sendMessage(senderID, message);
  }
}
