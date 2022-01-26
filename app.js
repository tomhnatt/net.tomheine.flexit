'use strict';

const Homey = require('homey');
const Modbus = require('jsmodbus')
	const net = require('net')
	const socket = new net.Socket()
	const client = new Modbus.client.TCP(socket, 1)
	const options = {
	'host' : "10.0.0.95",
	'port' : 8234
	} 

class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
   
   
  
   
  async onInit() {
    this.log('MyApp has been initialized');
	
	var app = this;
	
	
/*	client.readHoldingRegisters(9, 2).then(function (resp) {
		this.log("Exhaust air fan speed: " + toFloat(resp.response.body._valuesAsArray));
	}, console.error);

	client.readHoldingRegisters(9, 2).then(function (resp) {
		this.log("Exhaust air fan speed: " + toFloat(resp.response.body._valuesAsArray));

	}, console.error);

*/



	// -------   socket.connect(options);
	

}

}

module.exports = MyApp;


