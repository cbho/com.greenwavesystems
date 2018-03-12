'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class PowerNode1Device extends ZwaveDevice {
	
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
	}

	asyncResetMeter() {
		this.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
			if (err) return callback(err);
			if (result === 'TRANSMIT_COMPLETE_OK') return Promise.resolve(true);
			return Promise.reject('unknown_response');
		});
	}
}

module.exports = PowerNode1Device;