import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, WeatherService],
})
export class WeatherModule {}
