import { Injectable } from '@nestjs/common';
import { weatherApiFactory } from '@modules/weather/weather.queries';
import { weatherRoutes } from '@modules/weather/weather.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  weatherApi: any;
  async getWeather() {
    const { data: weather } = await this.weatherApi.get(
      weatherRoutes.forecast,
      {
        params: {
          q: 'Kharkiv',
        },
      },
    );
  }

  constructor(private readonly configService: ConfigService) {
    this.weatherApi = weatherApiFactory(configService.get.bind(this));
    this.getWeather();
  }
}
