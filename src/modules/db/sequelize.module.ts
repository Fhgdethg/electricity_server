import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule as NestSequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    NestSequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: Number(configService.get<string>('MYSQL_PORT')),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        autoLoadModels: true,
        // models: ['dist/modules/**/*.entity.js'],
        synchronize: true,
        // migrations: [ 'dist/db/migrations/**/*.js' ],
        // cli: { migrationsDir: 'src/db/migrations' },
      }),
    }),
  ],
})
export class SequelizeModule {}
