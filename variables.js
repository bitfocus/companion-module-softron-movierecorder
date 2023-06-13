export function getVariables() {
	const variables = []
	for (let s in this.sources) {
		let source = this.sources[s]
		let validSourceName = source.display_name?.replace(/[\W]/gi, '_')
		variables.push({
			name: `${source.display_name} Recording Status`,
			variableId: `rec_status_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Recording Time Elapsed`,
			variableId: `rec_time_elapsed_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Recording Time Remaining`,
			variableId: `rec_time_remaining_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Recording Name`,
			variableId: `rec_name_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Recording Destinations`,
			variableId: `rec_destinations_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Video Format`,
			variableId: `video_format_${validSourceName}`,
		})
		variables.push({
			name: `${source.display_name} Scheduled Recordings`,
			variableId: `scheduled_rec_${validSourceName}`,
		})
	}

	return variables
}

function getElapsedTime(startDate) {
	let currentTime = new Date()
	let recStart = new Date(startDate)
	let elapsed = Math.round((currentTime - recStart) / 1000)
	let elapsedTime = new Date(elapsed * 1000).toISOString().substr(11, 8)
	return elapsedTime
}

function getRemainingTime(endDate) {
	let currentTime = new Date()
	let recEnd = new Date(endDate)
	let remaining = Math.round((recEnd - currentTime) / 1000)
	let elapsedTime = new Date(remaining * 1000).toISOString().substr(11, 8)
	return elapsedTime
}

export function updateSourceVariables() {
	for (let s in this.sources) {
		let source = this.sources[s]
		let validSourceName = source.display_name?.replace(/[\W]/gi, '_')
		let status = ''
		let elapsedTime = '00:00:00'
		let remainingTime = '00:00:00'
		let sourceDestinations = []
		let destinations = ''
		if (source.is_recording && source.is_paused) {
			status = 'Paused'
			elapsedTime = '00:00:00'
		} else if (source.is_recording) {
			status = 'Recording'
			elapsedTime = getElapsedTime(source.recording_start_date)
			if (source.recording_end_date != '') {
				remainingTime = getRemainingTime(source.recording_end_date)
			}
		} else {
			status = 'Stopped'
			elapsedTime = '00:00:00'
		}
		for (let s in source.enabled_destinations) {
			let destination = source.enabled_destinations[s]
			sourceDestinations.push(destination.destination_name)
		}
		destinations = sourceDestinations.length ? sourceDestinations.join('\\n') : 'None'

		this.setVariableValues({
			[`rec_status_${validSourceName}`]: status,
			[`rec_time_elapsed_${validSourceName}`]: elapsedTime,
			[`rec_time_remaining_${validSourceName}`]: remainingTime,
			[`rec_name_${validSourceName}`]: source.recording_name,
			[`rec_destinations_${validSourceName}`]: destinations,
			[`video_format_${validSourceName}`]: source.video_format,
		})
	}
}
