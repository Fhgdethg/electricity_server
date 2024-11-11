import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TelegramModule } from '@modules/telegram/telegram.module';
import { MqttServerModule } from '@modules/mqttServer/mqttServer.module';
import { SequelizeModule } from '@db/sequelize.module';
import { ChatEventModule } from '@modules/chatEvent/chatEvent.module';
import { WhatsappModule } from '@modules/whatsapp/whatsapp.module';
import { ChatModule } from '@modules/chat/chat.module';
import { ElectricityForecastModule } from '@modules/electricityForecast/electricityForecast.module';
import { WeatherModule } from '@modules/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local', '.env.production'],
    }),
    SequelizeModule,
    TelegramModule,
    MqttServerModule,
    WhatsappModule,
    ChatModule,
    ChatEventModule,
    // WeatherModule,
    // ElectricityForecastModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
