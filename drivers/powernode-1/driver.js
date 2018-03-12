'use strict';

const Homey = require('homey');

class PowerNode1Driver extends Homey.Driver {
	
	onInit() {
		this.log('PowerNode1Driver has been inited');

		this._resetMeter = new Homey.FlowCardAction('PN1_reset_meter');
		this._resetMeter.register().registerRunListener( (args, state) => {
			return args.device.resetMeter();
		});
	}
	
}

module.exports = PowerNode1Driver;