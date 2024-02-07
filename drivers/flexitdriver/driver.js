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
  
	//From  https://apps.developer.homey.app/the-basics/devices/pairing
    //Now removed...
 }

	

  
    async onPair(session) {
    //From https://apps.developer.homey.app/advanced/custom-views/custom-pairing-views#back-end-api
    //now removed and instead directly executed in manual_pairing.html

    /*session.setHandler('manual_pairing', async function (data) {
      try {
        console.log('manual_pairing: ', data.flexit_adress,":",data.flexit_port);
        //await session.done();
        return [{
          name: "Flexit Nordic S4",
          data: {
            id: "flexit_s4_new_4",
          },
          store: {
            modbusTCP_ip: data.flexit_adress,//"192.168.0.95", //TODO: Aquire during installation
            modbusTCP_port: data.flexit_port//8234 //TODO: Aquire during installation
          },
          setting: {
            modbusTCP_updateInterval: 20000,
          }
        }];
      } catch (e) {
        console.log(e);
        throw new Error(this.homey.__('pair.error'));
      }
    });*/

  }
  

}

module.exports = MyDriver