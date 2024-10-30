import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';

import { ChatService } from '@modules/chat/chat.service';

import { telegramRoutes } from '@constants/telegramRoutes';

@Update()
export class ChatUpdate {
  private telegramBotToken: string;
  private telegramChatID: string;
  private yourTelegramChatID: string;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly telegramChatService: ChatService,
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
    ctx.reply(this.telegramChatService.startText);
  }

  @On(telegramRoutes.message)
  async handleMessage(@Ctx() ctx: any) {
    const command = ctx.update.message.text;

    await this.telegramChatService.router(command, this.yourTelegramChatID);
  }

  @On(telegramRoutes.channelPost)
  async handleTextMessage(@Ctx() ctx: any) {
    const command = ctx.update?.channel_post.text;

    await this.telegramChatService.router(command, this.telegramChatID);
  }
}
