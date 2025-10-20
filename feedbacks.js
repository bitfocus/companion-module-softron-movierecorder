import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorWhite = combineRgb(255, 255, 255)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	feedbacks.recording = {
		type: 'boolean',
		name: 'Recording Active',
		description: 'If a source is recording, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorRed,
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
			return this.sources[options.source]?.is_recording
		},
	}
	feedbacks.sourceDestinationEnabled = {
		type: 'boolean',
		name: 'Source Destination Enabled',
		description: 'If a source has the specified destination enabled, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
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
			} else {
				return false
			}
		},
	}
	feedbacks.sourceLocked = {
		type: 'boolean',
		name: 'Source Locked',
		description: 'If a source is locked, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: combineRgb(100, 100, 100),
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
			return this.sources[options.source]?.is_locked
		},
	}
	feedbacks.paused = {
		type: 'boolean',
		name: 'Recording Paused',
		description: 'If a source recording is paused, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: combineRgb(200, 200, 0),
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
			return this.sources[options.source]?.is_paused
		},
	}
	feedbacks.sourceRecordingName = {
		type: 'boolean',
		name: 'Source Recording Name',
		description: 'If a source has the specified recording name, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorGreen,
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
			return this.sources[options.source]?.recording_name == options.recording_name
		},
	}
	feedbacks.destinationWarning = {
		type: 'boolean',
		name: 'Destination Warning',
		description: 'If a destination has an active warning, change the style of the button',
		defaultStyle: {
			color: ColorWhite,
			bgcolor: ColorOrange,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Destination',
				id: 'destination',
				choices: this.destinationList,
				default: this.destinationListDefault,
			},
		],
		callback: ({ options }) => {
			return this.destinations[options.destination]?.warning_messages?.NotRelatedToSource?.length > 0
		},
	}
	feedbacks.sourceThumbnail = {
		type: 'advanced',
		name: 'Source Thumbnail',
		description: 'Display the source thumbnail on the button',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				choices: this.sourceList,
				default: this.sourceListDefault,
			},
			{
				type: 'number',
				label: 'Refresh Interval (ms)',
				id: 'interval',
				tooltip: 'How often to refresh the thumbnail in milliseconds',
				default: 500,
				min: 100,
				max: 10000,
			},
		],
		subscribe: (feedback) => {
			this.subscribeThumbnailFeedback(feedback)
		},
		unsubscribe: (feedback) => {
			this.unsubscribeThumbnailFeedback(feedback)
		},
		callback: async (feedback) => {
			return this.getThumbnailImage(feedback.options.source)
		},
	}
	return feedbacks
}
