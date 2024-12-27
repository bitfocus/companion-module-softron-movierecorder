export function getActions() {
	let actions = {}
	this.sourceList = []
	this.destinationList = []
	if (this.sources !== undefined) {
		for (let s in this.sources) {
			let source = this.sources[s]
			this.sourceList.push({ id: source.unique_id, label: source.display_name })
		}
		if (this.sourceList[0]) {
			this.sourceList.sort((a, b) =>
				a.label.localeCompare(b.label, undefined, {
					numeric: true,
				}),
			)
			this.sourceListDefault = this.sourceList[0].id
		} else {
			this.sourceListDefault = ''
		}
	}
	if (this.destinations !== undefined) {
		for (let s in this.destinations) {
			let destination = this.destinations[s]
			this.destinationList.push({ id: destination.unique_id, label: destination.name })
		}
		if (this.destinationList[0]) {
			this.destinationList.sort((a, b) =>
				a.label.localeCompare(b.label, undefined, {
					numeric: true,
				}),
			)
			this.destinationListDefault = this.destinationList[0].id
		} else {
			this.destinationListDefault = ''
		}
	}

	let cmd
	let type
	let params

	actions['record'] = {
		name: 'Record',
		options: [
			{
				type: 'multidropdown',
				label: 'Source(s)',
				id: 'source',
				default: [],
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/record`
				type = 'PUT'
				params = action.options.source

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['pause'] = {
		name: 'Pause',
		options: [
			{
				type: 'multidropdown',
				label: 'Source(s)',
				id: 'source',
				default: [],
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/pause`
				type = 'PUT'
				params = action.options.source

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['resume'] = {
		name: 'Resume',
		options: [
			{
				type: 'multidropdown',
				label: 'Source(s)',
				id: 'source',
				default: [],
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/resume`
				type = 'PUT'
				params = action.options.source

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['stop'] = {
		name: 'Stop',
		options: [
			{
				type: 'multidropdown',
				label: 'Source(s)',
				id: 'source',
				default: [],
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/stop`
				type = 'PUT'
				params = action.options.source

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['lock'] = {
		name: 'Lock',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/${action.options.source}/lock`
				type = 'GET'

				this.sendCommand(cmd, type)
			}
		},
	}
	actions['unlock'] = {
		name: 'Unlock',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null) {
				cmd = `sources/${action.options.source}/unlock`
				type = 'GET'

				this.sendCommand(cmd, type)
			}
		},
	}
	actions['setRecordingName'] = {
		name: 'Set Recording Name',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
			{
				type: 'textinput',
				useVariables: true,
				label: 'Recording Name',
				id: 'recordName',
				default: 'New Recording',
				required: true,
			},
		],
		callback: async (action) => {
			if (action.options.source !== null) {
				const recordingName = await this.parseVariablesInString(action.options.recordName)
				cmd = `sources/${action.options.source}/recording_name`
				type = 'PUT'
				params = {
					recording_name: recordingName.length ? recordingName : 'New Recording',
				}

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['setRecordingDestination'] = {
		name: 'Set Recording Destination',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
			{
				type: 'multidropdown',
				label: 'Destination',
				id: 'destination',
				default: this.destinationListDefault,
				choices: this.destinationList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null && action.options.destination !== null) {
				cmd = `sources/${action.options.source}/destinations`
				type = 'PUT'
				params = action.options.destination

				this.sendCommand(cmd, type, params)
			}
		},
	}
	actions['extendCurrentRecording'] = {
		name: 'Extend Current Recording',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
			{
				type: 'number',
				label: 'Minutes to Extend',
				id: 'time',
				default: 5,
				required: true,
			},
		],
		callback: (action) => {
			if (
				action.options.source !== null &&
				action.options.time !== null &&
				this.currentRecordings[action.options.source]
			) {
				let recording = this.currentRecordings[action.options.source]
				cmd = `scheduled_recordings/${recording.unique_id}`
				type = 'PUT'
				params = {
					duration: recording.duration + action.options.time,
				}

				this.sendCommand(cmd, type, params)
			} else {
				cmd = `scheduled_recordings`
				type = 'GET'

				this.sendCommand(cmd, type)
			}
		},
	}
	actions['startUpcomingRecording'] = {
		name: 'Start Upcoming Recording',
		description: 'Starts the next scheduled recording for a source immediately instead of at the scheduled time',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: this.sourceListDefault,
				choices: this.sourceList,
				required: true,
			},
		],
		callback: (action) => {
			if (action.options.source !== null && this.nextRecording[action.options.source]) {
				let recording = this.nextRecording[action.options.source]
				let today = new Date()
				let minutesElapsed = 60 * today.getHours() + today.getMinutes()
				cmd = `scheduled_recordings/${recording.unique_id}`
				type = 'PUT'
				params = {
					start_time: minutesElapsed,
				}

				this.sendCommand(cmd, type, params)
			} else {
				cmd = `scheduled_recordings`
				type = 'GET'

				this.sendCommand(cmd, type)
			}
		},
	}
	return actions
}
