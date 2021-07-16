exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks.recording = {
		type: 'boolean',
		label: 'Recording Status',
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
			},
		],
		callback: ({ options }) => {
			for (let s in this.sources) {
				let source = this.sources[s]
				if (source.is_recording && source.unique_id == options.source) {
					return true
				}
			}
		},
	}
	return feedbacks
}
