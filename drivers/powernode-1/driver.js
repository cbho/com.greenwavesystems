'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/280

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: value => ({
				'Switch Value': value,
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report.Value === 'on/enable',
			pollInterval: 'poll_interval_onoff',
		},
		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_cb: false,
			command_get_parser: () => ({
				Properties1: {
					Scale: 2,
				},
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report &&
					report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale') &&
					report.Properties2.Scale === 2) {
					return report['Meter Value (Parsed)'];
				}

				return null;
			},
			pollInterval: 'poll_interval_measure',
		},

		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_cb: false,
			command_get_parser: () => ({
				Properties1: {
					Scale: 0,
				},
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report &&
					report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale') &&
					report.Properties2.Scale === 0) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
			pollInterval: 'poll_interval_meter',
		},
	},
	settings: {
		0: {
			index: 0,
			size: 1,
		},
		1: {
			index: 1,
			size: 1,
			signed: false,
		},
	},
});

Homey.manager('flow').on('action.PN1_reset_meter', (callback, args) => {
	const node = module.exports.nodes[args.device.token];
	if (node &&
		node.instance &&
		node.instance.CommandClass &&
		node.instance.CommandClass.COMMAND_CLASS_METER) {
		node.instance.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
			if (err) return callback(err);
			if (result === 'TRANSMIT_COMPLETE_OK') return callback(null, true);
			return callback('unknown_response');
		});
	} else return callback('unknown_error');
});
