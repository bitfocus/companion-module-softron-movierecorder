module.exports = {
	getActions() {
		let actions = {}
		this.sourceList = []
		this.destinationList = []
		if (this.sources !== undefined) {
			for (let s in this.sources) {
				let source = this.sources[s]
				this.sourceList.push({ id: source.unique_id, label: source.display_name })
			}
			if (this.sourceList[0]) {
				this.sourceList.sort((a, b) => (a.id < b.id ? -1 : 1))
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
				this.destinationList.sort((a, b) => (a.id < b.id ? -1 : 1))
				this.destinationListDefault = this.destinationList[0].id
			} else {
				this.destinationListDefault = ''
			}
		}

		actions['record'] = {
			label: 'Record',
			options: [
				{
					type: 'dropdown',
					multiple: true,
					label: 'Source(s)',
					id: 'source',
					default: this.sourceListDefault,
					choices: this.sourceList,
					required: true,
				},
			],
		},
		actions['pause'] = {
				label: 'Pause',
				options: [
					{
						type: 'dropdown',
						multiple: true,
						label: 'Source(s)',
						id: 'source',
						default: this.sourceListDefault,
						choices: this.sourceList,
						required: true,
					},
				],
		}
		actions['resume'] = {
			label: 'Resume',
			options: [
				{
					type: 'dropdown',
					multiple: true,
					label: 'Source(s)',
					id: 'source',
					default: this.sourceListDefault,
					choices: this.sourceList,
					required: true,
				},
			],
		}
		actions['stop'] = {
			label: 'Stop',
			options: [
				{
					type: 'dropdown',
					multiple: true,
					label: 'Source(s)',
					id: 'source',
					default: this.sourceListDefault,
					choices: this.sourceList,
					required: true,
				},
			],
		}
		actions['lock'] = {
			label: 'Lock',
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
		}
		actions['unlock'] = {
			label: 'Unlock',
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
		}
		actions['setRecordingName'] = {
			label: 'Set Recording Name',
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
					label: 'Recording Name',
					id: 'recordName',
					default: 'New Recording',
					required: true,
				},
			],
		}
		actions['setRecordingDestination'] = {
			label: 'Set Recording Destination',
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
					type: 'dropdown',
					multiple: true,
					label: 'Destination',
					id: 'destination',
					default: this.destinationListDefault,
					choices: this.destinationList,
					required: true,
				},
			],
		}
		return actions
	},
}
