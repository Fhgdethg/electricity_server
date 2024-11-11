import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mqtt, { MqttClient } from 'mqtt';

import { TelegramService } from '@modules/telegram/telegram.service';

import { mqttServerRoutes } from '@modules/mqttServer/mqttServer.constants';

import { delay, getCurrentDateAsTimeString } from '@helpers/time';

import { TMqttServerMode } from '@modules/mqttServer/mqttServer.types';
import { ChatEventService } from '@modules/chatEvent/chatEvent.service';
import { ChatService } from '@modules/chat/chat.service';

@Injectable()
export class MqttServerService {
  private readonly mqttServer: string;
  private readonly mqttPort: number;
  private readonly mqttUser: string;
  private readonly mqttPass: string;
  private mqttClient: MqttClient;

  private isSchedulingActive: boolean = false;
  private scheduleInterval: number | undefined | NodeJS.Timeout | any;

  private mqttServerTestInterval: number | undefined | NodeJS.Timeout | any;
  private isFirstMqttServerTestRes = true;
  private previousIDOfTestMqttServerRes = 0;
  private IDOfTestMqttServerRes = 0;
  private countOfTestMqttServerExtraRes = 0;

  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramChatService: TelegramService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(ChatEventService)
    private readonly chatEventService: ChatEventService,
    private readonly configService: ConfigService,
  ) {
    console.log('MqttServerService initialized');
    this.mqttServer = this.configService.get<string>('MQTT_SERVER');
    this.mqttPort = Number(this.configService.get<string>('MQTT_PORT'));
    this.mqttUser = this.configService.get<string>('MQTT_USER');
    this.mqttPass = this.configService.get<string>('MQTT_PASS');
  }

  async onModuleInit() {
    const options = {
      port: this.mqttPort,
      username: this.mqttUser,
      password: this.mqttPass,
    };

    this.mqttClient = mqtt.connect(this.mqttServer, options);

    this.mqttClient.on(mqttServerRoutes.connect, () => {
      console.log('Connected to MQTT broker');

      this.mqttSubscriber();
    });

    this.mqttClient.on(mqttServerRoutes.message, async (topic, message) => {
      await this.router(topic, message.toString());
    });
    this.mqttClient.on(mqttServerRoutes.error, (err) => {
      console.error('MQTT connection error:', err);
    });
  }

  onModuleDestroy() {
    this.stopTestMqttServerInterval();
  }

  mqttSubscriber() {
    this.mqttClient.subscribe(mqttServerRoutes.serverResOn, (err) => {
      if (!err) console.log('Subscribed to server/on');
    });
    this.mqttClient.subscribe(mqttServerRoutes.serverResOff, (err) => {
      if (!err) console.log('Subscribed to server/off');
    });
    this.mqttClient.subscribe(mqttServerRoutes.serverResFirstOn, (err) => {
      if (!err) console.log('Subscribed to server/res/first-on');
    });
    this.mqttClient.subscribe(mqttServerRoutes.serverResTest, (err) => {
      if (!err) console.log('Subscribed to server/res/test');
    });
  }

  stopTestMqttServerInterval() {
    clearInterval(this.mqttServerTestInterval);
    this.isFirstMqttServerTestRes = true;
    this.previousIDOfTestMqttServerRes = 0;
    this.IDOfTestMqttServerRes = 0;
    this.countOfTestMqttServerExtraRes = 0;
  }

  async testMqttServerIntervalCallback() {
    // console.log(
    //   'callback',
    //   this.previousIDOfTestMqttServerRes,
    //   this.IDOfTestMqttServerRes,
    // );
    if (
      this.previousIDOfTestMqttServerRes !== this.IDOfTestMqttServerRes &&
      this.countOfTestMqttServerExtraRes <= 2
    ) {
      this.previousIDOfTestMqttServerRes = this.IDOfTestMqttServerRes;
      this.countOfTestMqttServerExtraRes = 0;
    } else if (
      this.previousIDOfTestMqttServerRes === this.IDOfTestMqttServerRes &&
      this.countOfTestMqttServerExtraRes > 2
    ) {
      this.chatService.sendMsgToSomeMessengers(
        this.chatService.messengers,
        `Електрика була вмикнута о ${getCurrentDateAsTimeString()}`,
      );
      await this.chatEventService.addChatEvent('Електрика була вмикнута');
      this.stopTestMqttServerInterval();
    } else if (
      this.previousIDOfTestMqttServerRes === this.IDOfTestMqttServerRes &&
      this.countOfTestMqttServerExtraRes <= 2
    ) {
      this.countOfTestMqttServerExtraRes++;
      this.chatService.sendMsgToSomeMessengers(
        this.chatService.messengers,
        `Сервер не відповів ${this.countOfTestMqttServerExtraRes} раз`,
      );
    }
  }

  mqttServerTestResHandler(testResID: number) {
    this.IDOfTestMqttServerRes = testResID;

    if (!this.mqttServerTestInterval && this.isFirstMqttServerTestRes) {
      this.mqttServerTestInterval = setInterval(
        this.testMqttServerIntervalCallback.bind(this),
        10000,
      );
      this.isFirstMqttServerTestRes = false;
    }
  }

  async router(topic: string, resData: string) {
    if (topic === mqttServerRoutes.serverResFirstOn) {
      this.chatService.sendMsgToSomeMessengers(
        this.chatService.messengers,
        `Електрику було вимкнено о ${getCurrentDateAsTimeString()}`,
      );
      await this.chatEventService.addChatEvent('Електрику вимкнено');
    } else if (topic === mqttServerRoutes.serverResOn) {
      this.chatService.sendMsgToSomeMessengers(
        this.chatService.messengers,
        'Електрика була вмикнута',
      );
      await this.chatEventService.addChatEvent('Електрика була вмикнута');
    } else if (topic === mqttServerRoutes.serverResOff) {
      this.chatService.sendMsgToSomeMessengers(
        this.chatService.messengers,
        'Електрику було вимкнено',
      );
      await this.chatEventService.addChatEvent('Електрика була вмикнута');
    } else if (topic === mqttServerRoutes.serverResTest)
      this.mqttServerTestResHandler(Number(resData));
  }

  chModeMqttServer(mode: TMqttServerMode, senderID: string) {
    this.mqttClient.publish(`${mqttServerRoutes.serverReq}${mode}`, senderID);
  }

  startWorkSchedule(hoursOn: number, hoursOff: number, senderID: string) {
    this.stopWorkSchedule();

    if (this.isSchedulingActive) return;

    this.isSchedulingActive = true;

    const schedule = async () => {
      while (this.isSchedulingActive) {
        this.chModeMqttServer('on', senderID);
        await delay(hoursOn * 1000);

        this.chModeMqttServer('off', senderID);
        await delay(hoursOff * 1000);
      }
    };

    this.scheduleInterval = setTimeout(schedule, 0);
  }

  stopWorkSchedule() {
    if (!this.isSchedulingActive) return;

    this.isSchedulingActive = false;

    if (this.scheduleInterval) clearTimeout(this.scheduleInterval);
  }
}
