'use strict';

const Homey = require('homey');

class PowerNode1Driver extends Homey.Driver {
	
	onInit() {
		this.log('PowerNode1Driver has been inited');
	}
	
}

module.exports = PowerNode1Driver;