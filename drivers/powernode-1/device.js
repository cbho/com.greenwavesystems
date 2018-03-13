'use strict';

const Homey = require('homey');
const ZwaveMeteringDevice = require('homey-meshdriver').ZwaveMeteringDevice;

class PowerNode1Device extends ZwaveMeteringDevice {
	
	async onMeshInit() {
		this.registerCapability('onoff', 'SWITCH_BINARY', {
			getOpts: {
				getOnStart: true,
				pollInterval: 'poll_interval_onoff',
			}
		});

		this.registerCapability('measure_power', 'METER', {
			getOpts: {
				getOnStart: false,
				pollInterval: 'poll_interval_measure'
			}
		});

		this.registerCapability('meter_power', 'METER', {
			getOpts: {
				getOnStart: false,
				pollInterval: 'poll_interval_meter'
			}
		});

		this.registerSetting('power_change_treshold', value => {
			return new Buffer(value);
		});

		this.registerSetting('keep_alive', value => {
			return new Buffer(value);
		});
	}
	
}

module.exports = PowerNode1Device;