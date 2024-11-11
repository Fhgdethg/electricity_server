import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';

import { TelegramService } from '@modules/telegram/telegram.service';

import { telegramRoutes } from '@modules/telegram/telegram.constants';
import { ChatService } from '@modules/chat/chat.service';
import { startText } from '@modules/chat/chat.constants';

@Update()
export class TelegramUpdate {
  private telegramBotToken: string;
  private readonly telegramChatID: string;
  private readonly yourTelegramChatID: string;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly telegramChatService: TelegramService,
    private readonly chatService: ChatService,
  ) {
    this.telegramBotToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.telegramChatID = this.configService.get<string>('TELEGRAM_CHAT_ID');
    this.yourTelegramChatID = this.configService.get<string>(
      'YOUR_TELEGRAM_CHAT_ID',
    );
  }

  @Start()
  async startBotCommand(@Ctx() ctx: Context) {
    ctx.reply(startText);
  }

  @On(telegramRoutes.message)
  async handleMessage(@Ctx() ctx: any) {
    const command = ctx.update.message.text;

    await this.chatService.router(command, this.yourTelegramChatID, 'telegram');
  }

  @On(telegramRoutes.channelPost)
  async handleTextMessage(@Ctx() ctx: any) {
    const command = ctx.update?.channel_post.text;

    await this.chatService.router(command, this.telegramChatID, 'telegram');
  }
}
