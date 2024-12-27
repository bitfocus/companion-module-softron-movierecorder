import { combineRgb } from '@companion-module/base'

export function getPresets() {
	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorRed = combineRgb(200, 0, 0)

	let presets = {}

	for (let s in this.sources) {
		let source = this.sources[s]
		let validSourceName = source.display_name?.replace(/[\W]/gi, '_')

		presets[`${source.display_name}_record`] = {
			type: 'button',
			category: `Recording Controls`,
			name: `Record ${source.display_name}`,
			options: {},
			style: {
				text: `Record\\n${source.display_name}`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'record',
							options: {
								source: [source.unique_id],
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: ColorRed,
						color: ColorWhite,
					},
				},
			],
		}
		presets[`${source.display_name}_stop`] = {
			type: 'button',
			category: `Recording Controls`,
			name: `Stop ${source.display_name}`,
			options: {},
			style: {
				text: `Stop\\n${source.display_name}`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'stop',
							options: {
								source: [source.unique_id],
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: ColorRed,
						color: ColorWhite,
					},
				},
			],
		}
		presets[`${source.display_name}_recording_status`] = {
			type: 'button',
			category: `Source Info`,
			name: `${source.display_name} Recording Status / Time Elapsed`,
			options: {},
			style: {
				text: `${source.display_name}\\n$(MovieRecorder:rec_status_${validSourceName})\\n$(MovieRecorder:rec_time_elapsed_${validSourceName})`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: ColorRed,
						color: ColorWhite,
					},
				},
			],
		}
		presets[`${source.display_name}_video_format`] = {
			type: 'button',
			category: `Source Info`,
			name: `${source.display_name} Video Format`,
			options: {},
			style: {
				text: `${source.display_name}\\n$(MovieRecorder:video_format_${validSourceName})`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`${source.display_name}_recording_destinations`] = {
			type: 'button',
			category: `Source Info`,
			name: `${source.display_name} Recording Destinations`,
			options: {},
			style: {
				text: `${source.display_name} Dest:\\n$(MovieRecorder:rec_destinations_${validSourceName})`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recording',
					options: {
						source: source.unique_id,
					},
					style: {
						bgcolor: ColorRed,
						color: ColorWhite,
					},
				},
			],
		}
		presets[`${source.display_name}_scheduled_recordings`] = {
			type: 'button',
			category: `Scheduled Recordings`,
			name: `Scheduled Recordings ${source.display_name}`,
			options: {},
			style: {
				text: `${source.display_name} Recordings:\\n$(MovieRecorder:scheduled_rec_${validSourceName})`,
				size: '7',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}
	}
	return presets
}
