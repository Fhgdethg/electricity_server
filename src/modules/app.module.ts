import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatModule } from '@modules/chat/chat.module';
import { MqttServerModule } from '@modules/mqtt-server/mqtt-server.module';
import { SequelizeModule } from '@db/sequelize.module';
import { ChatEventModule } from '@modules/chat-event/chat-event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.local', '.env.local.production'],
    }),
    SequelizeModule,
    ChatModule,
    MqttServerModule,
    ChatEventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
