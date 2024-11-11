import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export const weatherApiFactory = (get: any) => {
  console.log(get('WEATHER_URL') || 'No vars');
  return axios.create({
    baseURL: get('WEATHER_URL'),
    params: {
      appid: get('WEATHER_APP_ID'),
    },
  });
};
