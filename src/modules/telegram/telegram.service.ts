import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { ChatService } from '@modules/chat/chat.service';

@Injectable()
export class TelegramService {
  private readonly telegramChatID: string;
  private readonly yourTelegramChatID: string;

  constructor(
    @Inject(ChatEventService)
    private readonly chatEventService: ChatEventService,
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {
    this.telegramChatID = this.configService.get<string>('TELEGRAM_CHAT_ID');
    this.yourTelegramChatID = this.configService.get<string>(
      'YOUR_TELEGRAM_CHAT_ID',
    );
  }

  getTelegramChatID() {
    return this.chatService.getCurrentActiveChatID(
      this.telegramChatID,
      this.yourTelegramChatID,
    );
  }

  sendMessageToTelegram(message: string, senderID: string) {
    this.bot.telegram.sendMessage(senderID, message);
  }
}
