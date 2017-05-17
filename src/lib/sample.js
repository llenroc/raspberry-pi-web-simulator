import {Client, Message} from 'azure-iot-device'
import Protocol from './mqtt.js';
import wpi from './wiring-pi.js';
import codeFactory from '../data/codeFactory.js';
import BME280 from './bme280.js';

export default function run(option) {
  const prefix = '76f98350'; // a prefix of UUID
  var replaces = [
    {
      src: /require\('wiring-pi'\)/g,
      dest: 'wpi'
    }, {
      src: /require\('azure-iot-device'\)\.Client/g,
      dest: 'Client'
    }, {
      src: /require\('azure-iot-device'\)\.Message/g,
      dest: 'Message'
    }, {
      src: /require\('azure-iot-device-mqtt'\)\.Mqtt/g,
      dest: 'Protocol'
    }, {
      src: /require\('bme280-sensor'\)/g,
      dest: 'BME280'
    }, {
      src: /console\.log/g,
      dest: 'msgCb'
    }, {
      src: /console\.error/g,
      dest: 'errCb'
    }
  ];
  wpi.setFunc(option.ledSwitch);
  try {
    var src = codeFactory.getRunCode('index', replaces, prefix);
    var clientApp = new Function('replaces' + prefix, src);
    clientApp({
      wpi: wpi,
      Client: Client,
      Message: Message,
      Protocol: Protocol,
      BME280: BME280,
      msgCb: option.onMessage,
      errCb: option.onError
    });
    if (src.search(/^((?!\/\/).)*setInterval/gm) < 0) {
      option.onFinish();
    }
  } catch (err) {
    console.error(err);
    option.onError(err.message || JSON.stringify(err));
    option.onFinish();
  }
}
