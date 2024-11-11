import { forwardRef, Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MqttServerModule } from '@modules/mqttServer/mqttServer.module';
import { ChatModule } from '@modules/chat/chat.module';
import { TelegramModule } from '@modules/telegram/telegram.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => ChatModule),
    forwardRef(() => MqttServerModule),
    forwardRef(() => TelegramModule),
  ],
  providers: [ConfigService, WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
