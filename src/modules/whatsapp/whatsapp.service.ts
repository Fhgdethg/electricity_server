import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { whatsappRoutes } from '@modules/whatsapp/whatsapp.constants';
import { ChatService } from '@modules/chat/chat.service';

@Injectable()
export class WhatsappService {
  private readonly whatsappChatName: string;
  private readonly whatsappBotID: string;
  private whatsappChatID: string;
  private chat: any;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {
    this.whatsappChatName =
      this.configService.get<string>('WHATSAPP_CHAT_NAME');
    this.whatsappBotID = this.configService.get<string>('WHATSAPP_BOT_ID');
  }

  async onModuleInit() {
    const client: any = new Client({
      authStrategy: new LocalAuth(),
    });

    client.on(whatsappRoutes.ready, async () => {
      console.log('Client is ready!');
      const chats = await client.getChats();
      this.whatsappChatID = this.getCurrentGroupID(chats);
      this.chat = await client.getChatById(this.whatsappChatID);
    });

    client.on(whatsappRoutes.qr, (qr) => {
      QRCode.toString(
        qr,
        {
          type: 'terminal',
          small: true,
        },
        (err, url) => {
          if (err) throw err;
          console.log(url);
        },
      );
    });

    client.on(whatsappRoutes.message, async (msg) => {
      console.log(msg.body);
      await this.chatService.router(msg.body, this.whatsappChatID, 'whatsapp');
    });

    await client.initialize();
  }

  sendMessageToWhatsapp(message: string, senderID: string) {
    this.chat.sendMessage(message);
  }

  getWhatsappChatID() {
    return this.chatService.getCurrentActiveChatID(
      this.whatsappChatID,
      this.whatsappBotID,
    );
  }

  getCurrentGroupID(chats: any[]) {
    const chat = chats.find(
      (chat) =>
        chat.name === this.configService.get<string>('WHATSAPP_CHAT_NAME'),
    );
    return chat.id._serialized;
  }
}
