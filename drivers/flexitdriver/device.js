'use strict';

/*
TODO:
- Lage flows for å sette de ulike viftehastighetene (6 stykk) med logikk for å sjekke korrekte verdier - se regneark
- Skjule viftehastighetene (setpoints) i GUI (sette gui-komponent til null)
- Forsøke rydde opp i behovet for key av alle egenskaper
*/

const { Device } = require('homey');
const Modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, 1);
const options = {
  host: '192.168.0.95',  //TODO: Fikse at det ikke er fast IP
  port: 8234,  //TODO: Fikse at det ikke er fast port
};

let requestId = 0;

const TRIGGER_TEMPORARY_HIGH = [3006, 2, 'Temporary rapid ventilation', 'TRIGGER_TEMPORARY_HIGH'];
const CANCEL_TEMPORARY_HIGH = [3006, 1, 'Temporary rapid ventilation - cancellation', 'CANCEL_TEMPORARY_HIGH'];
const TRIGGER_TEMPORARY_FIREPLACE = [3007, 2, 'Trigger temporary fireplace ventilation', 'TRIGGER_TEMPORARY_FIREPLACE'];
const TRIGGER_HOME = [2013, 3, 'Trigger home ventilation', 'TRIGGER_HOME'];
const TRIGGER_AWAY = [2013, 2, 'Trigger away ventilation', 'TRIGGER_AWAY'];
const TRIGGER_HIGH = [2013, 4, 'Trigger high ventilation', 'TRIGGER_HIGH'];
// const TRIGGER_FUME_HOOD = [2013,5,"Trigger fume hood ventilation","TRIGGER_FUME_HOOD"];

const SUPPLY_AIR_FAN_SPEED = [5, 2, 'Supply air fan speed', 'SUPPLY_AIR_FAN_SPEED'];
const EXHAUST_AIR_FAN_SPEED = [9, 2, 'Exhaust air fan speed', 'EXHAUST_AIR_FAN_SPEED'];
const SUPPLY_AIR_FAN_SPEED_FEEDBACK = [21, 2, 'Supply air fan speed', 'SUPPLY_AIR_FAN_SPEED_FEEDBACK'];
const EXHAUST_AIR_FAN_SPEED_FEEDBACK = [25, 2, 'Exhaust air fan speed', 'EXHAUST_AIR_FAN_SPEED_FEEDBACK'];

const ROTARY_HEAT_EXCHANGER_SPEED = [1, 2, 'Rotary heat exchange speed', 'ROTARY_HEAT_EXCHANGER_SPEED'];

const SUPPLY_AIR_TEMPERATURE = [5, 2, 'Supply air temperature', 'SUPPLY_AIR_TEMPERATURE'];
const EXHAUST_AIR_TEMPERATURE = [13, 2, 'Exhaust air temperature', 'EXHAUST_AIR_TEMPERATURE'];
const EXTRACT_AIR_TEMPERATURE = [9, 2, 'Extract air temperature', 'EXTRACT_AIR_TEMPERATURE'];
const OUTSIDE_AIR_TEMPERATURE = [1, 2, 'Outside air temperature', 'OUTSIDE_AIR_TEMPERATURE'];
const ROOM_TEMPERATURE = [17, 2, 'Room temperature', 'ROOM_TEMPERATURE'];

const SETPOINT_HOME_TEMPERATURE = [1155, 2, 'Setpoint home temperature', 'SETPOINT_HOME_TEMPERATURE'];
const SETPOINT_AWAY_TEMPERATURE = [1163, 2, 'Setpoint away temperature', 'SETPOINT_AWAY_TEMPERATURE'];

const OPERATING_TIME_FILTER = [1271, 1, 'Operating time filter', 'OPERATING_TIME_FILTER'];
const OPERATING_TIME_FILTER_FOR_REPLACEMENT = [1269, 1, 'Operating time filter for replacement', 'OPERATING_TIME_FILTER_FOR_REPLACEMENT'];

const VENTILATION_MODE = [3034, 1, 'Heat recovery ventilation state', 'VENTILATION_MODE'];

const COMFORT_MODE = [2040, 1, 'Comfort button', 'COMFORT_MODE'];
const ROOM_OPERATION_MODE = [2013, 1, 'Room operation mode', 'ROOM_OPERATION_MODE'];

const RAPID_VENTILATION_RUNTIME = [1104, 1, 'Rapid ventilation runtime', 'RAPID_VENTILATION_RUNTIME']; // NB står 1103 i manualen
const FIREPLACE_VENTILATION_RUNTIME = [1106, 1, 'Fireplace ventilation runtime', 'FIREPLACE_VENTILATION_RUNTIME']; // NB står 1105 i manualen
const REMAINING_TIME_OF_RAPID_VENTILATION = [1035, 2, 'Remaining time of rapid ventilation', 'REMAINING_TIME_OF_RAPID_VENTILATION'];
const REMAINING_TIME_OF_FIREPLACE_VENTILATION = [1037, 2, 'Remaining time of fireplace ventilation', 'REMAINING_TIME_OF_FIREPLACE_VENTILATION'];

const ventilation_modes = ['unknown', 'off', 'away', 'home', 'high', 'fume_hood', 'fireplace', 'temporary_high'];

const SETPOINT_AWAY_SUPPLY_FAN = [1021, 2, 'Setpoint Away Supply Fan', 'SETPOINT_AWAY_SUPPLY_FAN'];
const SETPOINT_AWAY_EXTRACT_FAN = [1023, 2, 'Setpoint Away Extract Fan', 'SETPOINT_AWAY_EXTRACT_FAN'];
const SETPOINT_HOME_SUPPLY_FAN = [1013, 2, 'Setpoint Home Supply Fan', 'SETPOINT_HOME_SUPPLY_FAN'];
const SETPOINT_HOME_EXTRACT_FAN = [1015, 2, 'Setpoint Home Extract Fan', 'SETPOINT_HOME_EXTRACT_FAN'];
const SETPOINT_HIGH_SUPPLY_FAN = [1005, 2, 'Setpoint High Supply Fan', 'SETPOINT_HIGH_SUPPLY_FAN'];
const SETPOINT_HIGH_EXTRACT_FAN = [1007, 2, 'Setpoint High Extract Fan', 'SETPOINT_HIGH_EXTRACT_FAN'];

/// ////////

const SUPPLY_AIR_FAN_SPEED_KEY = 'SUPPLY_AIR_FAN_SPEED';
const EXHAUST_AIR_FAN_SPEED_KEY = 'EXHAUST_AIR_FAN_SPEED';
const SUPPLY_AIR_FAN_SPEED_FEEDBACK_KEY = 'SUPPLY_AIR_FAN_SPEED_FEEDBACK';
const EXHAUST_AIR_FAN_SPEED_FEEDBACK_KEY = 'EXHAUST_AIR_FAN_SPEED_FEEDBACK';

const ROTARY_HEAT_EXCHANGER_SPEED_KEY = 'ROTARY_HEAT_EXCHANGER_SPEED';

const SUPPLY_AIR_TEMPERATURE_KEY = 'SUPPLY_AIR_TEMPERATURE';
const EXHAUST_AIR_TEMPERATURE_KEY = 'EXHAUST_AIR_TEMPERATURE';
const EXTRACT_AIR_TEMPERATURE_KEY = 'EXTRACT_AIR_TEMPERATURE';
const OUTSIDE_AIR_TEMPERATURE_KEY = 'OUTSIDE_AIR_TEMPERATURE';
const ROOM_TEMPERATURE_KEY = 'ROOM_TEMPERATURE';

const SETPOINT_HOME_TEMPERATURE_KEY = 'SETPOINT_HOME_TEMPERATURE';
const SETPOINT_AWAY_TEMPERATURE_KEY = 'SETPOINT_AWAY_TEMPERATURE';

const VENTILATION_MODE_KEY = 'VENTILATION_MODE';

const RAPID_VENTILATION_RUNTIME_KEY = 'RAPID_VENTILATION_RUNTIME';
const FIREPLACE_VENTILATION_RUNTIME_KEY = 'FIREPLACE_VENTILATION_RUNTIME';
const REMAINING_TIME_OF_RAPID_VENTILATION_KEY = 'REMAINING_TIME_OF_RAPID_VENTILATION';
const REMAINING_TIME_OF_FIREPLACE_VENTILATION_KEY = 'REMAINING_TIME_OF_FIREPLACE_VENTILATION';

const SETPOINT_AWAY_SUPPLY_FAN_KEY = 'SETPOINT_AWAY_SUPPLY_FAN';
const SETPOINT_AWAY_EXTRACT_FAN_KEY = 'SETPOINT_AWAY_EXTRACT_FAN';
const SETPOINT_HOME_SUPPLY_FAN_KEY = 'SETPOINT_HOME_SUPPLY_FAN';
const SETPOINT_HOME_EXTRACT_FAN_KEY = 'SETPOINT_HOME_EXTRACT_FAN';
const SETPOINT_HIGH_SUPPLY_FAN_KEY = 'SETPOINT_HIGH_SUPPLY_FAN';
const SETPOINT_HIGH_EXTRACT_FAN_KEY = 'SETPOINT_HIGH_EXTRACT_FAN';

class MyDevice extends Device {

  /**
   * onInit is called when the device is initialized.
   */

  async changeSetpointFanFlexit(setpoint1, setpoint2, fan1, fan2) {
    // TODO: This creates an error and no output!
    this.log('hit');
    console.log('hit');
    const device = this;

	   client.writeMultipleRegisters(setpoint1[0], [this.fromFloat(fan1)[0], 0])
		 .then(resp => {
        device.log(resp);
		 }).catch(function() {
        device.error(arguments);
		 });

		 client.writeMultipleRegisters(setpoint2[0], [this.fromFloat(fan2)[0], 0])
		 .then(resp => {
        device.log(resp);
		 }).catch(function() {
        device.error(arguments);
		 });
  }

  async changeSetpointFlexit(mode, temperature) {
	  client.writeMultipleRegisters(mode[0], [this.fromFloat(temperature)[0], 0])
      .then(resp => {
        console.log(resp);
      }).catch(function() {
        console.error(arguments);
      });
  }

  async setComfortModeFlexit() {
	   // TODO: Reconnect https://github.com/Cloud-Automation/node-modbus/blob/v4.0-dev/examples/javascript/tcp/Reconnect.js

	  this.log('Activation comfort mode: 1');
	   const device = this;

    client.writeSingleRegister(2040, 1)
      .then(resp => {
        console.log(resp);
      }).catch(function() {
        console.error(arguments);
      });
  }

  async setVentilationRuntime(mode, duration) {
	   // TODO: Reconnect https://github.com/Cloud-Automation/node-modbus/blob/v4.0-dev/examples/javascript/tcp/Reconnect.js

	   const device = this;

    client.writeMultipleRegisters(mode[0] - 1, [0, duration]) // -1 her fordi selve verien lå i et høyere register og det ble laget i const over.
      .then(resp => {
        console.log(resp);
      }).catch(function() {
        console.error(arguments);
      });
  }

  async triggerActionFlexit(action) {
	   // TODO: Reconnect

	   this.log(`Trigger: ${action[2]}`);
	   const device = this;

    client.writeSingleRegister(action[0], action[1])
      .then(resp => {
        console.log(resp);
        // socket.end()
      }).catch(function() {
        console.error(arguments);
        // socket.end()
      });

    this.registerValues[VENTILATION_MODE_KEY] = action[1]; // TODO:For å hurtig oppdatere modus i visningen inntil det leses igjen.  Bør heller trigge lesing?
  }

  async cancelTemporary() {
	   // TODO:if temporary high, run temporary high again
	   // TODO: if fireplace, run fireplace again

  }

  async triggerVentilationModeActionFlexit(mode) {
	   this.log(`Trigger Venitlation Mode: ${mode}`);

	   if (mode == 'temporary_high') {
		   await this.triggerActionFlexit(TRIGGER_TEMPORARY_HIGH);
	   } else if (mode == 'fireplace') {
		   await this.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE);
	   } else if (mode == 'home') {
      await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_HOME);
	   } else if (mode == 'away') {
		  await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_AWAY);
	   } else if (mode == 'high') {
		  await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_HIGH);
	   } else if (mode == 'fume_hood') {
		  // await this.setComfortModeFlexit();
		   // await this.triggerActionFlexit(TRIGGER_FUME_HOOD);

		   // TODO:  Gjør noe med dette....
	   }

	    const tokens = { new_mode: mode }; // for example 3
    const state = { }; // for example "Amsterdam"

	   this._ventilationModeChanged
      .trigger(this, tokens, state)
      .then(this.log)
      .catch(this.error);
  }

  async readHoldingFlexit(register, prosessing) {
	    // TODO: Reconnect

	    // this.log("Read holding: " + register[2]);
    const d = this;
    client.readHoldingRegisters(register[0], register[1]).then(resp => {
      d.registerValues[register[3]] = prosessing(resp.response.body._valuesAsArray);
      // d.log("Value of holding " + register[2] + ": " + d.registerValues[register[3]] );
    }, console.error);
  }

  async readInputFlexit(register, prosessing) {
	    // TODO: Reconnect

	    // this.log("Read input: " + register[2]);
    const d = this;
    client.readInputRegisters(register[0], register[1]).then(resp => {
      d.registerValues[register[3]] = prosessing(resp.response.body._valuesAsArray);
      // d.log("Value of input " + register[2] + ": " + d.registerValues[register[3]] );
    }, console.error);
  }

  fromFloat(data) {
    const farr = new Float32Array(1);
    farr[0] = data;
    const barr = new Int16Array(farr.buffer);
    return [barr[1], barr[0]];
  }

  toFloat(data) {
    const pay = data;
    const buf = Buffer.allocUnsafe(4); // (4) is ok
    buf.writeUInt16BE(pay[0]); // high byte
    return Number(buf.readFloatBE(0).toFixed(0));
  }

	 toDirect(data) {
    return data[0];
  }

  toFloat1(data) {
    const pay = data;
    const buf = Buffer.allocUnsafe(4); // (4) is ok
    buf.writeUInt16BE(pay[0]); // high byte
    return Number(buf.readFloatBE(0).toFixed(1));
  }

	 toVentilationMode(data) {
    // console.log("mode"+data[0]);
    // return "mode"+data[0];
    return data[0];
  }

  translateToMode(mode) {
    // this.log("Ventilation mode:"+mode);
    // this.log(ventilation_modes[mode]);

    return ventilation_modes[mode];
  }

  async updateCapabilitesFromRegister() {
    this.setCapabilityValue('my_exhaust_air_fan_speed', this.registerValues[EXHAUST_AIR_FAN_SPEED_KEY]);
    this.setCapabilityValue('my_supply_air_fan_speed', this.registerValues[SUPPLY_AIR_FAN_SPEED_KEY]);

    this.setCapabilityValue('my_exhaust_air_fan_speed_feedback', this.registerValues[EXHAUST_AIR_FAN_SPEED_FEEDBACK_KEY]);
    this.setCapabilityValue('my_supply_air_fan_speed_feedback', this.registerValues[SUPPLY_AIR_FAN_SPEED_FEEDBACK_KEY]);

    this.setCapabilityValue('my_supply_air_temperature', this.registerValues[SUPPLY_AIR_TEMPERATURE_KEY]);
    this.setCapabilityValue('my_exhaust_air_temperature', this.registerValues[EXHAUST_AIR_TEMPERATURE_KEY]);
    this.setCapabilityValue('my_extract_air_temperature', this.registerValues[EXTRACT_AIR_TEMPERATURE_KEY]);
    this.setCapabilityValue('my_outside_air_temperature', this.registerValues[OUTSIDE_AIR_TEMPERATURE_KEY]);
    this.setCapabilityValue('my_room_temperature', this.registerValues[ROOM_TEMPERATURE_KEY]);

    this.setCapabilityValue('my_rotary_heat_exchanger_speed', this.registerValues[ROTARY_HEAT_EXCHANGER_SPEED_KEY]);

    if (this.registerValues[SETPOINT_HOME_TEMPERATURE_KEY] >= 10) {
      this.setCapabilityValue('my_setpoint_home_temperature', this.registerValues[SETPOINT_HOME_TEMPERATURE_KEY]);
    }
    if (this.registerValues[SETPOINT_AWAY_TEMPERATURE_KEY] >= 10) {
      this.setCapabilityValue('my_setpoint_away_temperature', this.registerValues[SETPOINT_AWAY_TEMPERATURE_KEY]);
    }

    this.setCapabilityValue('my_ventilation_mode', this.translateToMode(this.registerValues[VENTILATION_MODE_KEY]));

    this.setCapabilityValue('my_filter_replacement', this.registerValues['OPERATING_TIME_FILTER_FOR_REPLACEMENT'] - this.registerValues['OPERATING_TIME_FILTER']);

    this.setCapabilityValue('fan_setpoint_supply_away', this.registerValues['SETPOINT_AWAY_SUPPLY_FAN']);
    this.setCapabilityValue('fan_setpoint_extract_away', this.registerValues['SETPOINT_AWAY_EXTRACT_FAN']);
    this.setCapabilityValue('fan_setpoint_supply_home', this.registerValues['SETPOINT_HOME_SUPPLY_FAN']);
    this.setCapabilityValue('fan_setpoint_extract_home', this.registerValues['SETPOINT_HOME_EXTRACT_FAN']);
    this.setCapabilityValue('fan_setpoint_supply_high', this.registerValues['SETPOINT_HIGH_SUPPLY_FAN']);
    this.setCapabilityValue('fan_setpoint_extract_high', this.registerValues['SETPOINT_HIGH_EXTRACT_FAN']);

    // console.log(this.registerValues["SETPOINT_AWAY_SUPPLY_FAN"]+" "+this.registerValues["SETPOINT_AWAY_EXTRACT_FAN"]);
    // console.log(this.registerValues["SETPOINT_HOME_SUPPLY_FAN"]+" "+this.registerValues["SETPOINT_HOME_EXTRACT_FAN"]);
    // console.log(this.registerValues["SETPOINT_HIGH_SUPPLY_FAN"]+" "+this.registerValues["SETPOINT_HIGH_EXTRACT_FAN"]);
  }

  async updateFlexitValues() {
		  requestId++;

		  requestId %= 100;

		 // if(requestId == 0 )  // every 100-time
		 {
			 this.readHoldingFlexit(OPERATING_TIME_FILTER, this.toFloat);
			 this.readHoldingFlexit(OPERATING_TIME_FILTER_FOR_REPLACEMENT, this.toFloat);

			 this.readHoldingFlexit(SETPOINT_AWAY_SUPPLY_FAN, this.toFloat1);
			 this.readHoldingFlexit(SETPOINT_AWAY_EXTRACT_FAN, this.toFloat1);
			 this.readHoldingFlexit(SETPOINT_HOME_SUPPLY_FAN, this.toFloat1);
			 this.readHoldingFlexit(SETPOINT_HOME_EXTRACT_FAN, this.toFloat1);
			 this.readHoldingFlexit(SETPOINT_HIGH_SUPPLY_FAN, this.toFloat1);
			 this.readHoldingFlexit(SETPOINT_HIGH_EXTRACT_FAN, this.toFloat1);
		 }

		 // if(requestId % 10 == 0) //every 10-time
		 {
      this.readHoldingFlexit(COMFORT_MODE, this.toVentilationMode);
      this.readHoldingFlexit(ROOM_OPERATION_MODE, this.toVentilationMode);
		 }

		 this.readHoldingFlexit(SUPPLY_AIR_FAN_SPEED, this.toFloat);
		 this.readHoldingFlexit(EXHAUST_AIR_FAN_SPEED, this.toFloat);

		 this.readInputFlexit(SUPPLY_AIR_FAN_SPEED_FEEDBACK, this.toFloat);
		 this.readInputFlexit(EXHAUST_AIR_FAN_SPEED_FEEDBACK, this.toFloat);

	     this.readHoldingFlexit(ROTARY_HEAT_EXCHANGER_SPEED, this.toFloat);

		 this.readInputFlexit(SUPPLY_AIR_TEMPERATURE, this.toFloat);
		 this.readInputFlexit(EXHAUST_AIR_TEMPERATURE, this.toFloat);
		 this.readInputFlexit(EXTRACT_AIR_TEMPERATURE, this.toFloat);
		 this.readInputFlexit(OUTSIDE_AIR_TEMPERATURE, this.toFloat);
		 this.readInputFlexit(ROOM_TEMPERATURE, this.toFloat);

		 this.readInputFlexit(VENTILATION_MODE, this.toVentilationMode);

		  this.readHoldingFlexit(SETPOINT_HOME_TEMPERATURE, this.toFloat1);
		  this.readHoldingFlexit(SETPOINT_AWAY_TEMPERATURE, this.toFloat1);

		 this.readHoldingFlexit(RAPID_VENTILATION_RUNTIME, this.toDirect);
		 this.readHoldingFlexit(FIREPLACE_VENTILATION_RUNTIME, this.toDirect);
		 this.readInputFlexit(REMAINING_TIME_OF_RAPID_VENTILATION, this.toFloat);
		 this.readInputFlexit(REMAINING_TIME_OF_FIREPLACE_VENTILATION, this.toFloat);

		 // this.log(this.registerValues);
  }

  async setInitialValues() {
    this.registerValues =		{
		  SUPPLY_AIR_FAN_SPEED: 0,
		  EXHAUST_AIR_FAN_SPEED: 0,
		  SUPPLY_AIR_TEMPERATURE: 0.0,
		  EXHAUST_AIR_TEMPERATURE: 0.0,
		  EXTRACT_AIR_TEMPERATURE: 0.0,
		  OUTSIDE_AIR_TEMPERATURE: 0.0,
		  ROOM_TEMPERATURE: 0.0,
		  VENTILATION_MODE: 0,
		  COMFORT_MODE: 0,
		  ROOM_OPERATION_MODE: 0,
		  SETPOINT_HOME_TEMPERATURE: 0.0,
		  SETPOINT_AWAY_TEMPERATURE: 0.0,
		  OPERATING_TIME_FILTER: 0,
		  OPERATING_TIME_FILTER_FOR_REPLACEMENT: 0,
		  SUPPLY_AIR_FAN_SPEED_FEEDBACK: 0,
		  EXHAUST_AIR_FAN_SPEED_FEEDBACK: 0,
		  ROTARY_HEAT_EXCHANGER_SPEED: 0,
		  RAPID_VENTILATION_RUNTIME: 0,
		  FIREPLACE_VENTILATION_RUNTIME: 0,
		  REMAINING_TIME_OF_RAPID_VENTILATION: 0,
		  REMAINING_TIME_OF_FIREPLACE_VENTILATION: 0,
		  SETPOINT_AWAY_SUPPLY_FAN: 30,
		  SETPOINT_AWAY_EXTRACT_FAN: 30,
		  SETPOINT_HOME_SUPPLY_FAN: 30,
		  SETPOINT_HOME_EXTRACT_FAN: 30,
		  SETPOINT_HIGH_SUPPLY_FAN: 30,
		  SETPOINT_HIGH_EXTRACT_FAN: 30,

    };

    this.updateCapabilitesFromRegister();
  }

  triggerMyFlow(device, tokens, state) {
    this._triggerTemporaryHigh
      .trigger(device, tokens, state)
      .then(this.log)
      .catch(this.error);
  }

  async onInit() {
    this.log('MyDevice has been initialized');

    await this.setInitialValues();

	 // this._triggerTemporaryHigh = this.homey.flow.getDeviceTriggerCard("temporary_high");

    setInterval(this.updateCapabilitesFromRegister.bind(this), 2000);

    const device = this;

    // var closedOnPurpose = false;

    socket.on('connect', () => {
      device.log('Connected');
      // device.setComfortModeFlexit();
      device.updateFlexitValues = device.updateFlexitValues.bind(device);
      device.updateFlexitValues();

		 const settings = device.getSettings();

      setInterval(device.updateFlexitValues.bind(device), settings.modbusTCP_updateInterval);
    });

    socket.on('close', () => {
      device.log('Client closed.Reconnecting');

      // if (!device.closedOnPurpose) {
      socket.reconnect();
      // }
    });

    socket.connect(options);

    this.registerCapabilityListener('my_trigger_high', async value => {
      await this.triggerActionFlexit(TRIGGER_HIGH);
    });

    this.registerCapabilityListener('my_ventilation_mode', async value => {
      await this.triggerVentilationModeActionFlexit(value);
    });

    const changeModeAction = this.homey.flow.getActionCard('change_mode');
    changeModeAction.registerRunListener(async (args, state) => {
      device.log(`Flow: change mode: with mode${args.ventilation_mode}`);
	   device.triggerVentilationModeActionFlexit(args.ventilation_mode);
    });

    const startTemporaryFireplaceAction = this.homey.flow.getActionCard('start_temporary_fireplace');
    startTemporaryFireplaceAction.registerRunListener(async (args, state) => {
      device.log(`Flow: temporary fireplace: with duration${args.duration}`);
	   device.setVentilationRuntime(FIREPLACE_VENTILATION_RUNTIME, args.duration);
	   device.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE);
    });

    const startTemporaryHighAction = this.homey.flow.getActionCard('start_temporary_high');
    startTemporaryHighAction.registerRunListener(async (args, state) => {
      device.log(`Flow: temporary high: with duration${args.duration}`);
	   device.setVentilationRuntime(RAPID_VENTILATION_RUNTIME, args.duration);
	   device.triggerActionFlexit(TRIGGER_TEMPORARY_HIGH);
    });

    const changeSetpointHomeAction = this.homey.flow.getActionCard('change_setpoint_home');
    changeSetpointHomeAction.registerRunListener(async (args, state) => {
      device.log(`Flow: setpoint home changed${args.temperature}`);
	   device.changeSetpointFlexit(SETPOINT_HOME_TEMPERATURE, args.temperature);
    });

    const changeSetpointAwayAction = this.homey.flow.getActionCard('change_setpoint_away');
    changeSetpointAwayAction.registerRunListener(async (args, state) => {
      device.log(`Flow: setpoint away changed${args.temperature}`);
	   device.changeSetpointFlexit(SETPOINT_AWAY_TEMPERATURE, args.temperature);
    });

    const changeSetpointFanAwayAction = this.homey.flow.getActionCard('change_setpoint_fan_away');
    changeSetpointFanAwayAction.registerRunListener(async (args, state) => {
      device.log(`Flow: setpoint away fan speeds changed: Supply:${args.fan1} Extract:${args.fan2}`);
	   device.changeSetpointFanFlexit(SETPOINT_FAN_AWAY, args.fan1, args.fan2);
    });

    const changeSetpointFanHomeAction = this.homey.flow.getActionCard('change_setpoint_fan_home');
    changeSetpointFanHomeAction.registerRunListener(async (args, state) => {
      device.log(`Flow: setpoint home fan speeds changed: Supply:${args.fan1} Extract:${args.fan2}`);
	   device.changeSetpointFanFlexit(SETPOINT_HOME_SUPPLY_FAN, SETPOINT_HOME_EXTRACT_FAN, args.fan1, args.fan2);
    });

    const changeSetpointFanHighAction = this.homey.flow.getActionCard('change_setpoint_fan_high');
    changeSetpointFanHighAction.registerRunListener(async (args, state) => {
      device.log(`Flow: setpoint high fan speeds changed: Supply:${args.fan1} Extract:${args.fan2}`);
	   device.changeSetpointFanFlexit(SETPOINT_HIGH_SUPPLY_FAN, SETPOINT_HIGH_EXTRACT_FAN, args.fan1, args.fan2);
    });

    this._ventilationModeChanged = this.homey.flow.getDeviceTriggerCard('ventilation_mode_changed');

    /* DeviceApi.on('state-changed', (value) => {
      this.setCapabilityValue('my_supply_air_fan_speed', value).catch(this.error);
    }) */
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
