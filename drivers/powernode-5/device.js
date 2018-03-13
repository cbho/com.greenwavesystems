'use strict';

const Homey = require('homey');
const ZwaveMeteringDevice = require('homey-meshdriver').ZwaveMeteringDevice;

class PowerNode5Device extends ZwaveMeteringDevice {
	
	async onMeshInit() {

		/*
		====================================================
		Generic init for entire strip
		====================================================
		*/
		
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

		/*
		====================================================
		Init per socket for entire strip
		====================================================
		*/

		for (let i = 1; i < 6; i++) {
			this.registerCapability('onoff', 'SWITCH_BINARY', {
				getOpts: {
					getOnStart: true,
					pollInterval: `endpoint_interval_onoff_${i}`,
				},
				multiChannelNodeId: i
			});
			
			this.registerCapability('measure_power', 'METER', {
				getOpts: {
					getOnStart: false,
					pollInterval: `endpoint_interval_measure_${i}`,
				},
				multiChannelNodeId: i
			});

			this.registerCapability('meter_power', 'METER', {
				getOpts: {
					getOnStart: false,
					pollInterval: `endpoint_interval_meter_${i}`
				},
				multiChannelNodeId: i
			});
		}
	}
}

module.exports = PowerNode5Device;