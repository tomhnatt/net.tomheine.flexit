'use strict';

const Homey = require("homey");


class MyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
  
	//Fra https://apps.developer.homey.app/the-basics/devices/pairing
  return [{
    name: "Flexit Nordic S4 ny_2",
    data: {
      id: "flexit_s4_new_2",
    },
    store: {
      modbusTCP_ip: "192.168.0.95", //TODO: Aquire during installation
      modbusTCP_port: 8234 //TODO: Aquire during installation
    },
    setting: {
      modbusTCP_updateInterval: 20000,
    }
  }];
 }

	
	/*return {
  // The name of the device that will be displayed
  name: "Flexit Nordic S4 aggregat",

  // The data object is required and should be unique for the device.
  // So a device's MAC address would be good, but an IP address would
  // be bad since it can change over time.
  data: {
    id: "flexit_s4_agh2"
  },*/


  
    async onPair(session) {
    session.setHandler('list_devices', async () => {
      return [{
        name: "Flexit Nordic S4 ny3",
        data: {
          id: "flexit_s4_new_3",
        },
        store: {
          modbusTCP_ip: "192.168.0.95", //TODO: Aquire during installation
          modbusTCP_port: 8234 //TODO: Aquire during installation
        },
        setting: {
          modbusTCP_updateInterval: 20000,
        }
      }];
    });
  }
  

}

module.exports = MyDriver