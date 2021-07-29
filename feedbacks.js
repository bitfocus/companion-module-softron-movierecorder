exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks.recording = {
		type: 'boolean',
		label: 'Recording Active',
		description: 'If a source is recording, change the style of the button',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
		],
		callback: ({ options }) => {
			if (this.sources[options.source]?.is_recording) {
				return true
			}
		},
	}
	feedbacks.sourceDestinationEnabled = {
		type: 'boolean',
		label: 'Source Destination Enabled',
		description: 'If a source has the specified destination enabled, change the style of the button',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 200, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
			{
				type: 'dropdown',
				label: 'Destination',
				id: 'destination',
				choices: this.destinationList,
				default: this.destinationListDefault,
			},
		],
		callback: ({ options }) => {
			if (this.sources[options.source]?.enabled_destinations) {
				for (let s in this.sources[options.source]?.enabled_destinations) {
					let destination = this.sources[options.source]?.enabled_destinations[s]
					if (destination.destination_unique_id == options.destination) {
						return true
					}
				}
			}
		},
	}
	feedbacks.sourceLocked = {
		type: 'boolean',
		label: 'Source Locked',
		description: 'If a source is locked, change the style of the button',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(100, 100, 100),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
		],
		callback: ({ options }) => {
			if (this.sources[options.source]?.is_locked) {
				return true
			}
		},
	}
	feedbacks.paused = {
		type: 'boolean',
		label: 'Recording Paused',
		description: 'If a source recording is paused, change the style of the button',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(200, 200, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
		],
		callback: ({ options }) => {
			if (this.sources[options.source]?.is_paused) {
				return true
			}
		},
	}
	feedbacks.sourceRecordingName = {
		type: 'boolean',
		label: 'Source Recording Name',
		description: 'If a source has the specified recording name, change the style of the button',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 200, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
			{
				type: 'textinput',
				label: 'Recording Name',
				id: 'recording_name',
				default: 'New Recording',
			},
		],
		callback: ({ options }) => {
			if (this.sources[options.source]?.recording_name == options.recording_name) {
				return true
			}
		},
	}
	return feedbacks
}
