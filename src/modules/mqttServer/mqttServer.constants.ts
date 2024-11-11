export const mqttServerRoutes = {
  connect: 'connect',
  message: 'message',
  error: 'error',

  serverResFirstOn: 'server/res/first-on',

  serverResOn: 'server/res/on',
  serverResOff: 'server/res/off',

  serverReq: 'server/req/',

  serverReqSchedule: 'server/req/schedule',

  serverResTest: 'server/res/test',
} as const;
