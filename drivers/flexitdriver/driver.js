'use strict';

const { Driver, DeviceAPi } = require('homey');

class MyDriver extends Driver {

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
    //const devices = await DeviceApi.discoverDevices();
    //return devices;
	
	return {
  // The name of the device that will be displayed
  name: "Flexit Nordic S4",

  // The data object is required and should be unique for the device.
  // So a device's MAC address would be good, but an IP address would
  // be bad since it can change over time.
  data: {
    id: "flexit_sh4"
  },



  // Optional: sets the devices initial settings, this allows users to change
  // them after pairing in the device settings screen.
  //settings: {
  //  pincode: "1234",
  //},

  // Optional: These properties overwrite the defaults
  // that you specified in the driver manifest:
  /*icon: "/my_icon.svg", // relative to: /drivers/<driver_id>/assets/
  capabilities: ["onoff", "target_temperature"],
  capabilitiesOptions: {
    target_temperature: {
      min: 5,
      max: 35,
    },
  },*/
}

  }
  
    async onPair(session) {
    session.setHandler('list_devices', async () => {
      return {
        name: "Flexit Nordic S4",
        data: {
          id: "flexit_sh4",
        },
        store: {
          modbusTCP_ip: "192.168.0.95", //TODO: Aquire during installation
          modbusTCP_port: 8234 //TODO: Aquire during installation
        },
        setting: {
          modbusTCP_updateInterval: 20000,
        }
      };
    });
  }
  

}

module.exports = MyDriver;
