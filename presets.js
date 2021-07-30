exports.getPresets = function () {
	let presets = []
	for (let s in this.sources) {
		let source = this.sources[s]
		presets.push({
			category: `Recording Controls`,
			label: `Record ${source.display_name}`,
			bank: {
				style: 'text',
				text: `Record\\n${source.display_name}`,
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'record',
					options: {
						source: [source.unique_id],
					},
				},
			],
			feedbacks: [
				{
					type: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: this.rgb(200, 0, 0),
						color: this.rgb(255, 255, 255),
					},
				},
			],
		})
		presets.push({
			category: `Recording Controls`,
			label: `Stop ${source.display_name}`,
			bank: {
				style: 'text',
				text: `Stop\\n${source.display_name}`,
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'stop',
					options: {
						source: [source.unique_id],
					},
				},
			],
			feedbacks: [
				{
					type: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: this.rgb(200, 0, 0),
						color: this.rgb(255, 255, 255),
					},
				},
			],
		})
		presets.push({
			category: `Source Info`,
			label: `${source.display_name} Recording Status / Time Elapsed`,
			bank: {
				style: 'text',
				text: `${source.display_name}\\n$(MovieRecorder:rec_status_${source.display_name})\\n$(MovieRecorder:rec_time_elapsed_${source.display_name})`,
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			feedbacks: [
				{
					type: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: this.rgb(200, 0, 0),
						color: this.rgb(255, 255, 255),
					},
				},
			],
		})
		presets.push({
			category: `Source Info`,
			label: `${source.display_name} Video Format`,
			bank: {
				style: 'text',
				text: `${source.display_name}\\n$(MovieRecorder:video_format_${source.display_name})`,
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
		})
		presets.push({
			category: `Source Info`,
			label: `${source.display_name} Recording Destinations`,
			bank: {
				style: 'text',
				text: `${source.display_name} Dest:\\n$(MovieRecorder:rec_destinations_${source.display_name})`,
				size: 'auto',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			feedbacks: [
				{
					type: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: this.rgb(200, 0, 0),
						color: this.rgb(255, 255, 255),
					},
				},
			],
		})
		presets.push({
			category: `Scheduled Recordings`,
			label: `Upcoming Scheduled Recordings ${source.display_name}`,
			bank: {
				style: 'text',
				text: `${source.display_name} Upcoming:\\n$(MovieRecorder:upcoming_rec_${source.display_name})`,
				size: '7',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
		})
		presets.push({
			category: `Scheduled Recordings`,
			label: `Active Scheduled Recordings ${source.display_name}`,
			bank: {
				style: 'text',
				text: `${source.display_name} Active:\\n$(MovieRecorder:active_rec_${source.display_name})`,
				size: '7',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
		})
	}
	presets.push({
		category: `Scheduled Recordings`,
		label: `Active Scheduled Recordings`,
		bank: {
			style: 'text',
			text: `Active Rec:\\n$(MovieRecorder:active_scheduled_rec)`,
			size: '7',
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
	})
	presets.push({
		category: `Scheduled Recordings`,
		label: `Upcoming Scheduled Recordings`,
		bank: {
			style: 'text',
			text: `Upcoming:\\n$(MovieRecorder:upcoming_scheduled_rec)`,
			size: '7',
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
	})

	return presets
}
