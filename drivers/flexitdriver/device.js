'use strict';

/*
TODO:
- Lage flows for å sette de ulike viftehastighetene (6 stykk) med logikk for å sjekke korrekte verdier - se regneark
- Skjule viftehastighetene (setpoints) i GUI (sette gui-komponent til null)
- Forsøke rydde opp i behovet for key av alle egenskaper
*/

const Homey = require('homey');
const Modbus = require('jsmodbus');
const net = require('net');
const {Log} = require('homey-log');

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, 1);

let requestId = 0;






//TRIGGERS
const TRIGGER_TEMPORARY_HIGH = [3006, 2, 'Temporary rapid ventilation', 'TRIGGER_TEMPORARY_HIGH',];
const TRIGGER_TEMPORARY_FIREPLACE = [3007, 2, 'Trigger temporary fireplace ventilation', 'TRIGGER_TEMPORARY_FIREPLACE'];
const TRIGGER_HOME = [2013, 3, 'Trigger home ventilation', 'TRIGGER_HOME'];
const TRIGGER_AWAY = [2013, 2, 'Trigger away ventilation', 'TRIGGER_AWAY'];
const TRIGGER_STOP = [2013, 1, 'Trigger away ventilation', 'TRIGGER_STOP'];
const TRIGGER_HIGH = [2013, 4, 'Trigger high ventilation', 'TRIGGER_HIGH'];
// const TRIGGER_FUME_HOOD = [2013,5,"Trigger fume hood ventilation","TRIGGER_FUME_HOOD"];

//VALUES

//modbus-register, modbus-size, title, key, min, maks, default, unit, capability
const SUPPLY_AIR_FAN_SPEED = [5, 2, 'Supply air fan speed', 'SUPPLY_AIR_FAN_SPEED',0,100,0,"%","my_supply_air_fan_speed"];
const EXHAUST_AIR_FAN_SPEED = [9, 2, 'Exhaust air fan speed', 'EXHAUST_AIR_FAN_SPEED',0,100,0,"%","my_exhaust_air_fan_speed"];
const SUPPLY_AIR_FAN_SPEED_FEEDBACK = [21, 2, 'Supply air fan speed', 'SUPPLY_AIR_FAN_SPEED_FEEDBACK',0,18000,0,"rpm","measure_supply_air_fan_speed_feedback"];
const EXHAUST_AIR_FAN_SPEED_FEEDBACK = [25, 2, 'Exhaust air fan speed', 'EXHAUST_AIR_FAN_SPEED_FEEDBACK',0,18000,0,"rpm","measure_exhaust_air_fan_speed_feedback"];

const ROTARY_HEAT_EXCHANGER_SPEED = [1, 2, 'Rotary heat exchange speed', 'ROTARY_HEAT_EXCHANGER_SPEED',0,100,0,"%","measure_rotary_heat_exchanger_speed"];

const SUPPLY_AIR_TEMPERATURE = [5, 2, 'Supply air temperature', 'SUPPLY_AIR_TEMPERATURE',-50,80,0.0,"%","measure_supply_air_temperature"];
const EXHAUST_AIR_TEMPERATURE = [13, 2, 'Exhaust air temperature', 'EXHAUST_AIR_TEMPERATURE',-50,80,0.0,"%","measure_exhaust_air_temperature"];
const EXTRACT_AIR_TEMPERATURE = [9, 2, 'Extract air temperature', 'EXTRACT_AIR_TEMPERATURE',-50,80,0.0,"%","measure_extract_air_temperature"];
const OUTSIDE_AIR_TEMPERATURE = [1, 2, 'Outside air temperature', 'OUTSIDE_AIR_TEMPERATURE',-50,80,0.0,"%","measure_outside_air_temperature"];
const ROOM_TEMPERATURE = [17, 2, 'Room temperature', 'ROOM_TEMPERATURE',0,50,0.0,"C","measure_room_temperature"];

const SETPOINT_HOME_TEMPERATURE = [1155, 2, 'Setpoint home temperature', 'SETPOINT_HOME_TEMPERATURE', 10, 30, 10.0,"C","my_setpoint_home_temperature"];
const SETPOINT_AWAY_TEMPERATURE = [1163, 2, 'Setpoint away temperature', 'SETPOINT_AWAY_TEMPERATURE', 10, 30, 10.0,"C","my_setpoint_away_temperature"];

const OPERATING_TIME_FILTER = [1271, 1, 'Operating time filter', 'OPERATING_TIME_FILTER',0,9999,0,"h",null];
const OPERATING_TIME_FILTER_FOR_REPLACEMENT = [1269, 1, 'Operating time filter for replacement', 'OPERATING_TIME_FILTER_FOR_REPLACEMENT',0,9990,0,"h",null];

const VENTILATION_MODE = [3034, 1, 'Heat recovery ventilation state', 'VENTILATION_MODE',1,7,3,null,null];

//TODO: Needed????
const COMFORT_MODE = [2040, 1, 'Comfort button', 'COMFORT_MODE',0,1,0,null,null];
const ROOM_OPERATION_MODE = [2013, 1, 'Room operation mode', 'ROOM_OPERATION_MODE',0,1,0,null,null];

const RAPID_VENTILATION_RUNTIME = [1104, 1, 'Rapid ventilation runtime', 'RAPID_VENTILATION_RUNTIME',1,360,1,"min","my_rapid_ventilation_runtime"]; // NB står 1103 i manualen
const FIREPLACE_VENTILATION_RUNTIME = [1106, 1, 'Fireplace ventilation runtime', 'FIREPLACE_VENTILATION_RUNTIME',0,360,0,"min","my_fireplace_ventilation_runtime"]; // NB står 1105 i manualen
const REMAINING_TIME_OF_RAPID_VENTILATION = [1035, 2, 'Remaining time of rapid ventilation', 'REMAINING_TIME_OF_RAPID_VENTILATION',0,360,0,"min","measure_remaining_time_of_rapid_ventilation"];
const REMAINING_TIME_OF_FIREPLACE_VENTILATION = [1037, 2, 'Remaining time of fireplace ventilation', 'REMAINING_TIME_OF_FIREPLACE_VENTILATION',0,360,0,"min","measure_remaining_time_of_fireplace_ventilation"];

const SETPOINT_AWAY_SUPPLY_FAN = [1021, 2, 'Setpoint Away Supply Fan', 'SETPOINT_AWAY_SUPPLY_FAN',30,100,30,"%","fan_setpoint_supply_away"];
const SETPOINT_AWAY_EXTRACT_FAN = [1023, 2, 'Setpoint Away Extract Fan', 'SETPOINT_AWAY_EXTRACT_FAN',30,100,30,"%","fan_setpoint_extract_away"];
const SETPOINT_HOME_SUPPLY_FAN = [1013, 2, 'Setpoint Home Supply Fan', 'SETPOINT_HOME_SUPPLY_FAN',30,100,30,"%","fan_setpoint_supply_home"];
const SETPOINT_HOME_EXTRACT_FAN = [1015, 2, 'Setpoint Home Extract Fan', 'SETPOINT_HOME_EXTRACT_FAN',30,100,30,"%","fan_setpoint_extract_home"];
const SETPOINT_HIGH_SUPPLY_FAN = [1005, 2, 'Setpoint High Supply Fan', 'SETPOINT_HIGH_SUPPLY_FAN',30,100,30,"%","fan_setpoint_supply_high"];
const SETPOINT_HIGH_EXTRACT_FAN = [1007, 2, 'Setpoint High Extract Fan', 'SETPOINT_HIGH_EXTRACT_FAN',30,100,30,"%","fan_setpoint_extract_high"];
const SETPOINT_COOKER_HOOD_SUPPLY_FAN = [1037, 2, 'Setpoint Cooker hood Supply Fan', 'SETPOINT_COOKER_HOOD_SUPPLY_FAN',30,100,30,"%","fan_setpoint_supply_cooker_hood"];
const SETPOINT_COOKER_HOOD_EXTRACT_FAN = [1039, 2, 'Setpoint Cooker hood Extract Fan', 'SETPOINT_COOKER_HOOD_EXTRACT_FAN',30,100,30,"%","fan_setpoint_extract_cooker_hood"];
const SETPOINT_FIREPLACE_SUPPLY_FAN = [1029, 2, 'Setpoint Fireplace Supply Fan', 'SETPOINT_FIREPLACE_SUPPLY_FAN',30,100,30,"%","fan_setpoint_supply_fireplace"];
const SETPOINT_FIREPLACE_EXTRACT_FAN = [1031, 2, 'Setpoint Fireplace Extract Fan', 'SETPOINT_FIREPLACE_EXTRACT_FAN',30,100,30,"%","fan_setpoint_extract_fireplace"];

const TRIGGERS = [TRIGGER_TEMPORARY_HIGH, TRIGGER_TEMPORARY_FIREPLACE,TRIGGER_HOME, TRIGGER_AWAY,TRIGGER_HIGH];
const PROPERTIES = [SUPPLY_AIR_FAN_SPEED, EXHAUST_AIR_FAN_SPEED, SUPPLY_AIR_FAN_SPEED_FEEDBACK, EXHAUST_AIR_FAN_SPEED_FEEDBACK, 
                    ROTARY_HEAT_EXCHANGER_SPEED,
                    SUPPLY_AIR_TEMPERATURE, EXHAUST_AIR_TEMPERATURE, EXTRACT_AIR_TEMPERATURE, OUTSIDE_AIR_TEMPERATURE,  ROOM_TEMPERATURE,  
                    SETPOINT_HOME_TEMPERATURE, SETPOINT_AWAY_TEMPERATURE, 
                    OPERATING_TIME_FILTER, OPERATING_TIME_FILTER_FOR_REPLACEMENT,
                    VENTILATION_MODE, 
                    COMFORT_MODE,  ROOM_OPERATION_MODE, 
                    RAPID_VENTILATION_RUNTIME, FIREPLACE_VENTILATION_RUNTIME, REMAINING_TIME_OF_RAPID_VENTILATION, REMAINING_TIME_OF_FIREPLACE_VENTILATION, 
                    SETPOINT_AWAY_SUPPLY_FAN, SETPOINT_AWAY_EXTRACT_FAN, SETPOINT_HOME_SUPPLY_FAN, SETPOINT_HOME_EXTRACT_FAN , SETPOINT_HIGH_SUPPLY_FAN, SETPOINT_HIGH_EXTRACT_FAN, SETPOINT_COOKER_HOOD_SUPPLY_FAN,SETPOINT_COOKER_HOOD_EXTRACT_FAN, SETPOINT_FIREPLACE_SUPPLY_FAN, SETPOINT_FIREPLACE_EXTRACT_FAN ]


const VENTILATION_MODE_UÆNKNOWN = 0;
const VENTILATION_MODE_OFF = 1
const VENTILATION_MODE_AWAY = 2;
const VENTILATION_MODE_HOME = 3;
const VENTILATION_MODE_HIGH = 4;
const VENTILATION_MODE_COOKER_HOOD = 5;
const VENTILATION_MODE_TEMPORARY_FIREPLACE = 6;
const VENTILATION_MODE_TEMPORARY_HIGH = 7;


const ventilation_modes = ['unknown', 'off','away', 'home', 'high', 'cooker_hood', 'fireplace', 'temporary_high'];

const FILTER_REPLACEMENT_TIME_KEY = "FILTER_REPLACEMENT_TIME";

class MyDevice extends Homey.Device {

 registerValues = {};

  /**
   * onInit is called when the device is initialized.
   */

  async changeSetpointFanFlexit(setpoint1, setpoint2, fan1, fan2) {
    // TODO: This creates an error and no output!
    const device = this;

	   client.writeMultipleRegisters(setpoint1[0], [this.fromFloat(fan1)[0], 0])
		 .then(resp => {
          device.writeDebugInfo(resp);
		 }).catch(function() {
          device.writeErrorInfo(arguments);
		 });

		 client.writeMultipleRegisters(setpoint2[0], [this.fromFloat(fan2)[0], 0])
		 .then(resp => {
      device.writeDebugInfo(resp);
		 }).catch(function() {
        device.writeErrorInfo(arguments);
		 });
  }

  async changeSetpointTemperatureFlexit(mode, temperature) {


    const device = this;

	  client.writeMultipleRegisters(mode[0], [this.fromFloat(temperature)[0], 0])
      .then(resp => {
        device.writeDebugInfo(resp);
      }).catch(function() {
        device.writeErrorInfo(arguments);
      });
  }

  //TODO:  Not used - remove?
  async setComfortModeFlexit() {
	   // TODO: Reconnect https://github.com/Cloud-Automation/node-modbus/blob/v4.0-dev/examples/javascript/tcp/Reconnect.js
	   const device = this;

    client.writeSingleRegister(2040, 1)
      .then(resp => {
        device.writeDebugInfo(resp);
      }).catch(function() {
        device.writeErrorInfo(arguments);
      });
  }

  async setVentilationRuntime(mode, duration) {
	   // TODO: Reconnect https://github.com/Cloud-Automation/node-modbus/blob/v4.0-dev/examples/javascript/tcp/Reconnect.js

	   const device = this;

    client.writeMultipleRegisters(mode[0] - 1, [0, duration]) // -1 her fordi selve verien lå i et høyere register og det ble laget i const over.
      .then(resp => {
        device.writeDebugInfo(resp);
      }).catch(function() {
        device.writeErrorInfo(arguments);
      });
  }

  async triggerActionFlexit(action) {
	   // TODO: Reconnect

	   this.writeDebugInfo(`Trigger: ${action[2]}`);
	   const device = this;

    client.writeSingleRegister(action[0], action[1])
      .then(resp => {
        device.writeDebugInfo(resp);
      }).catch(function() {
        device.writeErrorInfo(arguments);
      });

     
      
  }

  async cancelTemporary() {
    if(this.registerValues[this.propertyKey(VENTILATION_MODE)] == VENTILATION_MODE_TEMPORARY_HIGH)  // temporary high
      await this.triggerActionFlexit(TRIGGER_TEMPORARY_HIGH);
    if(this.registerValues[this.propertyKey(VENTILATION_MODE)] == VENTILATION_MODE_TEMPORARY_FIREPLACE)  // temporary fireplace
      await this.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE); //TODO:  This has to complete betfore next step in triggerVentilationModeActionFlexit
  }

  async resetFilterReplacement() {

    const device = this;

     client.writeMultipleRegisters(OPERATING_TIME_FILTER[0],[0,0])
      .then(resp => {
        device.writeDebugInfo(resp);
      }).catch(function(err) {
       device.writeErrorInfo(err);
      });
  }

  async triggerVentilationModeActionFlexit(mode) {
    this.writeDebugInfo(`Trigger Venitlation Mode: ${mode}`);

     //TODO:  Include this: device.setVentilationRuntime(RAPID_VENTILATION_RUNTIME, args.duration);?

	   if (mode == 'temporary_high') {
      await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_TEMPORARY_HIGH);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_TEMPORARY_HIGH; 
	   } else if (mode == 'fireplace') {
      await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_TEMPORARY_FIREPLACE; 
	   } else if (mode == 'stop') {
      await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_STOP);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_OFF; 
	   } else if (mode == 'home') {
      await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_HOME);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_HOME; 
	   } else if (mode == 'away') {
		  await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_AWAY);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_AWAY; 
	   } else if (mode == 'high') {
		  await this.cancelTemporary();
		   await this.triggerActionFlexit(TRIGGER_HIGH);
       this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_HIGH; 
	   } else if (mode == 'cooker_hood') {
        this.writeDebugInfo("Ventilation modde cooker hood not supported. Starting Temprorary Fireplace");
        await this.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE);
        this.registerValues[this.propertyKey(VENTILATION_MODE)] = VENTILATION_MODE_TEMPORARY_FIREPLACE; 
		   // TODO:  Find a way to implement...
	   }

     this.updateCapabilitesFromRegister();
  }

  async readHoldingFlexit(register, prosessing) {
	    // TODO: Reconnect

	    // this.log("Read holding: " + register[2]);
    const device = this;
    client.readHoldingRegisters(register[0], register[1]).then(resp => {
      device.registerValues[register[3]] = prosessing(resp.response.body._valuesAsArray);
      // d.log("Value of holding " + register[2] + ": " + d.registerValues[register[3]] );
    }, function (err) {
     device.writeErrorInfo(err+ "Read holding: " + register[2]);
    }); 
  }

  async readInputFlexit(register, prosessing) {
	    // TODO: Reconnect

	    // this.log("Read input: " + register[2]);
    const device = this;
    client.readInputRegisters(register[0], register[1]).then(resp => {
      device.registerValues[register[3]] = prosessing(resp.response.body._valuesAsArray);
      // d.log("Value of input " + register[2] + ": " + d.registerValues[register[3]] );
    }, function (err) {
      device.writeErrorInfo(err);
    });  
  }

propertyKey(property) {
  return property[3];
}

propertyMin(property) {
  return property[4];
}

propertyMax(property) {
  return property[5];
}

propertyDefault(property) {
  return property[6];
}

propertyCapability(property) {
  return property[8];
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
    return data[0];
  }

  translateToMode(mode) {
    return ventilation_modes[mode];
  }

  async updateCapabilityFromRegisterValue(property) {
    //console.log(this.registerValues);
    //console.log("hit"+"-"+property+"-"+this.registerValues[this.propertyKey(property)]);
    if (this.registerValues[this.propertyKey(property)] >= this.propertyMin(property)) //TODO: Add this:  && this.registerValues[this.propertyKey(property)] <= this.propertyMax(property))
    this.setCapabilityValue(this.propertyCapability(property), this.registerValues[this.propertyKey(property)]);
  }

  async updateCapabilitesFromRegister() {

    PROPERTIES.forEach((item) => {
      if(this.propertyCapability(item) != null)
      this.updateCapabilityFromRegisterValue(item);
    })
  
    //Capabilities that has to be set manually
    this.setCapabilityValue('my_ventilation_mode', this.translateToMode(this.registerValues[this.propertyKey(VENTILATION_MODE)]));
    this.setCapabilityValue('my_filter_replacement',  this.registerValues[FILTER_REPLACEMENT_TIME_KEY]);

  }

  async updateFlexitValues() {
		 

		  requestId %= 10000;



		if(requestId % 100 == 0 || requestId < 5)  // every 100-time
		{
			 this.readHoldingFlexit(OPERATING_TIME_FILTER, this.toFloat);
			 this.readHoldingFlexit(OPERATING_TIME_FILTER_FOR_REPLACEMENT, this.toFloat);
       this.registerValues[FILTER_REPLACEMENT_TIME_KEY] =  this.registerValues[this.propertyKey(OPERATING_TIME_FILTER_FOR_REPLACEMENT)] - this.registerValues[this.propertyKey(OPERATING_TIME_FILTER)];

			 this.readHoldingFlexit(SETPOINT_AWAY_SUPPLY_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_AWAY_EXTRACT_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_HOME_SUPPLY_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_HOME_EXTRACT_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_HIGH_SUPPLY_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_HIGH_EXTRACT_FAN, this.toFloat);
       this.readHoldingFlexit(SETPOINT_COOKER_HOOD_SUPPLY_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_COOKER_HOOD_EXTRACT_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_FIREPLACE_SUPPLY_FAN, this.toFloat);
			 this.readHoldingFlexit(SETPOINT_FIREPLACE_EXTRACT_FAN, this.toFloat); 
    }

	  if(requestId % 10 == 0 || requestId < 5) //every 10-time
		{
      this.readHoldingFlexit(COMFORT_MODE, this.toVentilationMode);
      this.readHoldingFlexit(ROOM_OPERATION_MODE, this.toVentilationMode);
		}

		this.readHoldingFlexit(SUPPLY_AIR_FAN_SPEED, this.toFloat);
		this.readHoldingFlexit(EXHAUST_AIR_FAN_SPEED, this.toFloat);

		this.readInputFlexit(SUPPLY_AIR_FAN_SPEED_FEEDBACK, this.toFloat);
		this.readInputFlexit(EXHAUST_AIR_FAN_SPEED_FEEDBACK, this.toFloat);

	  this.readHoldingFlexit(ROTARY_HEAT_EXCHANGER_SPEED, this.toFloat);

		this.readInputFlexit(SUPPLY_AIR_TEMPERATURE, this.toFloat1);
		this.readInputFlexit(EXHAUST_AIR_TEMPERATURE, this.toFloat1);
		this.readInputFlexit(EXTRACT_AIR_TEMPERATURE, this.toFloat1);
		this.readInputFlexit(OUTSIDE_AIR_TEMPERATURE, this.toFloat1);
		this.readInputFlexit(ROOM_TEMPERATURE, this.toFloat1);
  
		this.readInputFlexit(VENTILATION_MODE, this.toVentilationMode);
   
		this.readHoldingFlexit(SETPOINT_HOME_TEMPERATURE, this.toFloat1);
		this.readHoldingFlexit(SETPOINT_AWAY_TEMPERATURE, this.toFloat1);

		 this.readHoldingFlexit(RAPID_VENTILATION_RUNTIME, this.toDirect);
		 this.readHoldingFlexit(FIREPLACE_VENTILATION_RUNTIME, this.toDirect);
		 this.readInputFlexit(REMAINING_TIME_OF_RAPID_VENTILATION, this.toFloat);
		 this.readInputFlexit(REMAINING_TIME_OF_FIREPLACE_VENTILATION, this.toFloat);

     requestId++;
  }

  async setInitialValues() {
    
    this.registerValues["FILTER_REPLACEMENT_TIME"] = 0;

    PROPERTIES.forEach((item) => {
      this.registerValues[this.propertyKey(item)] = this.propertyDefault(item);
    })

    console.log (this.registerValues);

    this.updateCapabilitesFromRegister();
  }

  async writeDebugInfo(message){
    var err = new Error();
    console.log(message + "\n@"+ err.stack);
    //TODO: this.homeyLog.captureMessage(message);
  }

  async writeErrorInfo(err){
    var e = new Error();
    console.error("Client error: ", err +  e.stack);
    if(typeof err == "Error")
    {
      //TODO: this.homeyLog.captureException (err);
    }
    else
    {
      //TODO: this.homeyLog.captureMessage (err.toString());
    }
  }


  async onInit() {

    await this.setInitialValues();

    setInterval(this.updateCapabilitesFromRegister.bind(this), 5000);

    const device = this;

   // this.homeyLog = new Log({ homey: this.homey });
    device.writeDebugInfo("Flexit-app has been initialized");

    
    

    const settings = device.getSettings();

    const options = {
      host:  device.getStoreValue("modbusTCP_ip"), 
      port: device.getStoreValue("modbusTCP_port")
    };

    //TODO: this.homeyLog = this.homeyLog.setExtra(options);

    socket.on('connect', () => {
      this.writeDebugInfo("Connected to Flexit");
      // device.setComfortModeFlexit();
      device.updateFlexitValues = device.updateFlexitValues.bind(device);
      device.updateFlexitValues();
      setInterval(device.updateFlexitValues.bind(device), settings.modbusTCP_updateInterval);
    });

    socket.on('close', function() {
      device.writeDebugInfo("Connecection to Flexit is Closed. Reconnection");
      socket.reconnect();
    });

    socket.on('error', function (err) {
     device.writeErrorInfo(err);
    })

    socket.connect(options);

    this.registerCapabilityListener('my_ventilation_mode', async value => {
      await this.triggerVentilationModeActionFlexit(value);
    });

 
    //Maintanance Actions
    this.registerCapabilityListener('button.reset_filter', async () => {
            
      device.writeDebugInfo(`Flow: Reset filter replacement`);
	   device.resetFilterReplacement();
      return;
    });
  
    //Flows


    const changeModeAction = this.homey.flow.getActionCard('change_mode');
    changeModeAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: change mode: with mode${args.ventilation_mode}`);
	   device.triggerVentilationModeActionFlexit(args.ventilation_mode);
    });

    const startTemporaryFireplaceAction = this.homey.flow.getActionCard('start_temporary_fireplace');
    startTemporaryFireplaceAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: temporary fireplace: with duration${args.duration}`);
	   device.setVentilationRuntime(FIREPLACE_VENTILATION_RUNTIME, args.duration);
	   device.triggerActionFlexit(TRIGGER_TEMPORARY_FIREPLACE);
    });

    const startTemporaryHighAction = this.homey.flow.getActionCard('start_temporary_high');
    startTemporaryHighAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: temporary high: with duration${args.duration}`);
	   device.setVentilationRuntime(RAPID_VENTILATION_RUNTIME, args.duration);
	   device.triggerActionFlexit(TRIGGER_TEMPORARY_HIGH);
    });

    const changeSetpointHomeAction = this.homey.flow.getActionCard('change_setpoint_home');
    changeSetpointHomeAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: setpoint home changed${args.temperature}`);
	   device.changeSetpointTemperatureFlexit(SETPOINT_HOME_TEMPERATURE, args.temperature);
    });

    const changeSetpointAwayAction = this.homey.flow.getActionCard('change_setpoint_away');
    changeSetpointAwayAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: setpoint away changed${args.temperature}`);
	   device.changeSetpointTemperatureFlexit(SETPOINT_AWAY_TEMPERATURE, args.temperature);
    });



    const changeSetpointFansAction = this.homey.flow.getActionCard('change_setpoint_fans');
    changeSetpointFansAction.registerRunListener(async (args, state) => {
      device.writeDebugInfo(`Flow: setpoint fan speeds changed for mode ${args.mode} Supply:${args.fan1} Extract:${args.fan2}`);
      if(args.mode == "away")
      device.changeSetpointFanFlexit(SETPOINT_AWAY_SUPPLY_FAN, SETPOINT_AWAY_EXTRACT_FAN, args.fan1, args.fan2);
      else if(args.mode == "home")
      device.changeSetpointFanFlexit(SETPOINT_HOME_SUPPLY_FAN, SETPOINT_HOME_EXTRACT_FAN, args.fan1, args.fan2);
      else if(args.mode == "high")
      device.changeSetpointFanFlexit(SETPOINT_HIGH_SUPPLY_FAN, SETPOINT_HIGH_EXTRACT_FAN, args.fan1, args.fan2);
      else if(args.mode == "cooker_hood")
      device.changeSetpointFanFlexit(SETPOINT_COOKER_HOOD_SUPPLY_FAN, SETPOINT_COOKER_HOOD_EXTRACT_FAN, args.fan1, args.fan2);
      else if(args.mode == "fireplace")
      device.changeSetpointFanFlexit(SETPOINT_FIREPLACE_SUPPLY_FAN, SETPOINT_FIREPLACE_EXTRACT_FAN, args.fan1, args.fan2);
    });

    // TODO : Should not be needed (automatic update of change flows: https://apps.developer.homey.app/the-basics/flow#custom-capability-changed)


    /*this._ventilationModeChanged = this.homey.flow.getDeviceTriggerCard('ventilation_mode_changed');
    this._roomTemperatureChanged = this.homey.flow.getDeviceTriggerCard('room_temperature_changed');*/

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