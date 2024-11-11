import { Module } from '@nestjs/common';
import { ElectricityForecastService } from './electricityForecast.service';

@Module({
  providers: [ElectricityForecastService],
})
export class ElectricityForecastModule {}
