'use strict';

const Homey = require('homey');

class PowerNode5Driver extends Homey.Driver {
	
	onInit() {
		this.log('PowerNode5Driver has been inited');
	}
	
}

module.exports = PowerNode5Driver;