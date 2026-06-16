import { combineRgb } from '@companion-module/base'

export function getPresets() {
	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorRed = combineRgb(200, 0, 0)

	const presets = {}

	// As of API 2.0 presets are categorised via a separate "structure" of sections,
	// rather than a `category` property on each preset. Collect the ids per section here.
	const recordingControls = []
	const sourceInfo = []
	const scheduledRecordings = []
	const sourceThumbnails = []

	for (let s in this.sources) {
		let source = this.sources[s]
		let validSourceName = source.display_name?.replace(/[\W]/gi, '_')

		const recordId = `${source.display_name}_record`
		presets[recordId] = {
			type: 'simple',
			name: `Record ${source.display_name}`,
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
		recordingControls.push(recordId)

		const stopId = `${source.display_name}_stop`
		presets[stopId] = {
			type: 'simple',
			name: `Stop ${source.display_name}`,
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
		recordingControls.push(stopId)

		const recordingStatusId = `${source.display_name}_recording_status`
		presets[recordingStatusId] = {
			type: 'simple',
			name: `${source.display_name} Recording Status / Time Elapsed`,
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
		sourceInfo.push(recordingStatusId)

		const videoFormatId = `${source.display_name}_video_format`
		presets[videoFormatId] = {
			type: 'simple',
			name: `${source.display_name} Video Format`,
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
		sourceInfo.push(videoFormatId)

		const recordingDestinationsId = `${source.display_name}_recording_destinations`
		presets[recordingDestinationsId] = {
			type: 'simple',
			name: `${source.display_name} Recording Destinations`,
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
		sourceInfo.push(recordingDestinationsId)

		const scheduledRecordingsId = `${source.display_name}_scheduled_recordings`
		presets[scheduledRecordingsId] = {
			type: 'simple',
			name: `Scheduled Recordings ${source.display_name}`,
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
		scheduledRecordings.push(scheduledRecordingsId)

		// Thumbnail preset. The Source Thumbnail feedback is an advanced feedback that
		// returns a png64 image. When a button is created from this preset, Companion 5.0
		// converts the legacy style into elements, which always includes an image element,
		// and wires the advanced feedback to it automatically - so the live thumbnail shows
		// without the user having to add an image element by hand.
		const thumbnailId = `${source.display_name}_thumbnail`
		presets[thumbnailId] = {
			type: 'simple',
			name: `${source.display_name} Thumbnail`,
			style: {
				text: '',
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
					feedbackId: 'sourceThumbnail',
					options: {
						source: source.unique_id,
						interval: 500,
					},
				},
			],
		}
		sourceThumbnails.push(thumbnailId)
	}

	const structure = [
		{
			id: 'recording_controls',
			name: 'Recording Controls',
			definitions: recordingControls,
		},
		{
			id: 'source_info',
			name: 'Source Info',
			definitions: sourceInfo,
		},
		{
			id: 'scheduled_recordings',
			name: 'Scheduled Recordings',
			definitions: scheduledRecordings,
		},
		{
			id: 'source_thumbnails',
			name: 'Source Thumbnails',
			definitions: sourceThumbnails,
		},
	]

	return { structure, presets }
}
