exports.updateVariableDefinitions = function () {
	const variables = []

	for (let s in this.sources) {
		let source = this.sources[s]
		variables.push({
			label: `Recording Status: ${source.display_name}`,
			name: `rec_status_${source.display_name}`,
		})
		variables.push({
			label: `Recording Time Elapsed: ${source.display_name}`,
			name: `rec_time_${source.display_name}`,
		})
		variables.push({
			label: `Recording Name: ${source.display_name}`,
			name: `rec_name_${source.display_name}`,
		})
		variables.push({
			label: `Recording Destinations: ${source.display_name}`,
			name: `rec_destinations_${source.display_name}`,
		})
	}

	this.setVariableDefinitions(variables)
	this.updateSourceVariables()
}

exports.updateSourceVariables = function () {
	for (let s in this.sources) {
		let source = this.sources[s]
		let status = ''
		let timecode = '00:00:00'
		let sourceDestinations = []
		let destinations = ''
		if (source.is_recording && source.is_paused) {
			status = 'Paused'
			timecode = '00:00:00'
		} else if (source.is_recording) {
			status = 'Recording'
			timecode = getTimecode(source.recording_start_date)
		} else {
			status = 'Stopped'
			timecode = '00:00:00'
		}
		for (let s in source.enabled_destinations) {
			let destination = source.enabled_destinations[s]
			sourceDestinations.push(destination.destination_name)
		}
		destinations = sourceDestinations.join('\\n')
		this.setVariable(`rec_status_${source.display_name}`, status)
		this.setVariable(`rec_time_${source.display_name}`, timecode)
		this.setVariable(`rec_name_${source.display_name}`, source.recording_name)
		this.setVariable(`rec_destinations_${source.display_name}`, destinations)
	}
}

getTimecode = function (startDate) {
	let currentTime = new Date()
	let recStart = new Date(startDate)
	let elapsed = Math.round((currentTime - recStart) / 1000)
	let timecode = new Date(elapsed * 1000).toISOString().substr(11, 8)
	return timecode
}
