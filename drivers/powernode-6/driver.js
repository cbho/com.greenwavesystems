'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');
const pollInterval = {};

// http://www.pepper1.net/zwavedb/device/280

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_get_cb: false,
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: value => ({
				'Switch Value': value,
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report.Value === 'on/enable',
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
				if (report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale') &&
					report.Properties2.Scale === 2) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
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
				if (report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale') &&
					report.Properties2.Scale === 0) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
		},
	},

	beforeInit: (token, callback) => {
		const node = module.exports.nodes[token];
		if (node) {
			module.exports.getSettings(node.device_data, (err, settings) => {
				if (err) return console.error('error retrieving settings for device', err);

				if (settings.zw_node_id.indexOf('.') < 0 && !pollInterval.hasOwnProperty(token)) {
					pollInterval[token] = {};
					for(var i = 1; i <= 6; i++) {
						pollInterval[token][i] = [];
						if (settings['poll_onoff_' + i]) setMultiInterval('onoff', i, settings['poll_onoff_' + i], token);
						if (settings['poll_measure_' + i]) setMultiInterval('measure', i, settings['poll_measure_' + i], token);
						if (settings['poll_meter_' + i]) setMultiInterval('meter', i, settings['poll_meter_' + i], token);
					}
				}
			});
		}

		// Initiate the device
		return callback();
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
		poll_onoff_1: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 1, newValue, deviceData.token),
		poll_measure_1: (newValue, oldValue, deviceData) => setMultiInterval('measure', 1, newValue, deviceData.token),
		poll_meter_1: (newValue, oldValue, deviceData) => setMultiInterval('meter', 1, newValue, deviceData.token),
		poll_onoff_2: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 2, newValue, deviceData.token),
		poll_measure_2: (newValue, oldValue, deviceData) => setMultiInterval('measure', 2, newValue, deviceData.token),
		poll_meter_2: (newValue, oldValue, deviceData) => setMultiInterval('meter', 1, newValue, deviceData.token),
		poll_onoff_3: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 3, newValue, deviceData.token),
		poll_measure_3: (newValue, oldValue, deviceData) => setMultiInterval('measure', 3, newValue, deviceData.token),
		poll_meter_3: (newValue, oldValue, deviceData) => setMultiInterval('meter', 3, newValue, deviceData.token),
		poll_onoff_4: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 4, newValue, deviceData.token),
		poll_measure_4: (newValue, oldValue, deviceData) => setMultiInterval('measure', 4, newValue, deviceData.token),
		poll_meter_4: (newValue, oldValue, deviceData) => setMultiInterval('meter', 4, newValue, deviceData.token),
		poll_onoff_5: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 5, newValue, deviceData.token),
		poll_measure_5: (newValue, oldValue, deviceData) => setMultiInterval('measure', 5, newValue, deviceData.token),
		poll_meter_5: (newValue, oldValue, deviceData) => setMultiInterval('meter', 5, newValue, deviceData.token),
		poll_onoff_6: (newValue, oldValue, deviceData) => setMultiInterval('onoff', 6, newValue, deviceData.token),
		poll_measure_6: (newValue, oldValue, deviceData) => setMultiInterval('measure', 6, newValue, deviceData.token),
		poll_meter_6: (newValue, oldValue, deviceData) => setMultiInterval('meter', 6, newValue, deviceData.token),
	},
});

Homey.manager('flow').on('action.PN6_reset_meter', (callback, args) => {
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

function setMultiInterval (capability, multiChannel, value, token) {
	const node = module.exports.nodes[token];

	if (pollInterval[token][multiChannel][capability]) {
		clearInterval(pollInterval[token][multiChannel][capability]);
		pollInterval[token][multiChannel][capability] = null
	}

	if (value === 0) return;

	switch (capability) {
		case 'onoff': {
			if (typeof node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_SWITCH_BINARY !== "undefined") {
				pollInterval[token][multiChannel].onoff = setInterval(() => {
					module.exports._debug('polling: [' + multiChannel + '].' + capability);
					node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_GET({});
				}, value * 1000);
			}
		} break;

		case 'measure': {
			if (typeof node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_METER !== "undefined") {
				pollInterval[token][multiChannel].measure = setInterval(() => {
					module.exports._debug('polling: [' + multiChannel + '].' + capability);
					node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_METER.METER_GET({
						Properties1: {
							Scale: 2,
						},
					});
				}, value * 1000);
			}
		} break;

		case 'meter': {
			if (typeof node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_METER !== "undefined") {
				pollInterval[token][multiChannel].meter = setInterval(() => {
					module.exports._debug('polling: [' + multiChannel + '].' + capability);
					node.instance.MultiChannelNodes[multiChannel].CommandClass.COMMAND_CLASS_METER.METER_GET({
						Properties1: {
							Scale: 0,
						},
					});
				}, value * 1000);
			}
		} break;
	}
}
