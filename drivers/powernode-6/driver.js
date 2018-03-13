'use strict';

const Homey = require('homey');

class PowerNode6Driver extends Homey.Driver {
	
	onInit() {
		this.log('PowerNode6Driver has been inited');
	}
	
}

module.exports = PowerNode6Driver;