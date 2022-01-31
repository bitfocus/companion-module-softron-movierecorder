exports.updateVariableDefinitions = function () {
	const variables = []
	for (let s in this.sources) {
		let source = this.sources[s]
		variables.push({
			label: `${source.display_name} Recording Status`,
			name: `rec_status_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Recording Time Elapsed`,
			name: `rec_time_elapsed_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Recording Time Remaining`,
			name: `rec_time_remaining_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Recording Name`,
			name: `rec_name_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Recording Destinations`,
			name: `rec_destinations_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Video Format`,
			name: `video_format_${source.display_name}`,
		})
		variables.push({
			label: `${source.display_name} Scheduled Recordings`,
			name: `scheduled_rec_${source.display_name}`,
		})
	}

	this.setVariableDefinitions(variables)
	this.updateSourceVariables()
}

exports.updateSourceVariables = function () {
	for (let s in this.sources) {
		let source = this.sources[s]
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
		this.setVariable(`rec_status_${source.display_name}`, status)
		this.setVariable(`rec_time_elapsed_${source.display_name}`, elapsedTime)
		this.setVariable(`rec_time_remaining_${source.display_name}`, remainingTime)
		this.setVariable(`rec_name_${source.display_name}`, source.recording_name)
		this.setVariable(`rec_destinations_${source.display_name}`, destinations)
		this.setVariable(`video_format_${source.display_name}`, source.video_format)
	}
}

getElapsedTime = function (startDate) {
	let currentTime = new Date()
	let recStart = new Date(startDate)
	let elapsed = Math.round((currentTime - recStart) / 1000)
	let elapsedTime = new Date(elapsed * 1000).toISOString().substr(11, 8)
	return elapsedTime
}
getRemainingTime = function (endDate) {
	let currentTime = new Date()
	let recEnd = new Date(endDate)
	let remaining = Math.round((recEnd - currentTime) / 1000)
	let elapsedTime = new Date(remaining * 1000).toISOString().substr(11, 8)
	return elapsedTime
}
