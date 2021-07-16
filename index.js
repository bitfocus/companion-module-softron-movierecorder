const instance_skel = require('../../instance_skel')
const actions = require('./actions')
const presets = require('./presets')
const { updateVariableDefinitions, updateSourceVariables } = require('./variables')
const { initFeedbacks } = require('./feedbacks')

const fetch = require('node-fetch')

let debug
let log

class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)

		Object.assign(this, {
			...actions,
			...presets,
		})

		this.updateVariableDefinitions = updateVariableDefinitions
		this.updateSourceVariables = updateSourceVariables

		this.sources = []
		this.sourceList = []
		this.destinations = []
		this.destinationList = []
		this.errorCount = 0
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				default: 8080,
				width: 2,
				regex: this.REGEX_PORT,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password (optional)',
				default: '',
				width: 6,
			},
		]
	}

	destroy() {
		this.debug('destroy', this.id)
		this.sources = []
		this.sourceList = []
		this.destinations = []
		this.destinationList = []
		this.stopPolling()
	}

	init() {
		debug = this.debug
		log = this.log

		this.status(this.STATUS_WARNING, 'Connecting')
		this.errorCount = 0
		this.timeOut = 0
		this.pollingInterval = 5000
		this.awaitingConnection = true

		this.password = this.config.password !== '' ? '?password=' + this.config.password : ''
		this.getSources()
		this.actions()
		this.initVariables()
		this.initFeedbacks()
		this.initPresets()

		this.setupPolling()
	}

	initVariables() {
		this.updateVariableDefinitions()
	}

	initFeedbacks() {
		const feedbacks = initFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets(updates) {
		this.setPresetDefinitions(this.getPresets())
	}

	actions(system) {
		this.setActions(this.getActions())
	}

	action(action) {
		let id = action.action
		let opt = action.options
		let cmd = ''
		let type = ''
		let params = ''
		switch (id) {
			case 'record':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/record`
					type = 'get'
				}
				break
			case 'pause':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/pause`
					type = 'get'
				}
				break
			case 'resume':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/resume`
					type = 'get'
				}
				break
			case 'stop':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/stop`
					type = 'get'
				}
				break
			case 'lock':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/lock`
					type = 'get'
				}
				break
			case 'unlock':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/unlock`
					type = 'get'
				}
				break
			case 'setRecordingName':
				if (opt.source !== null) {
					cmd = `sources/${opt.source}/recording_name`
					type = 'PUT'
					params = {
						recording_name: opt.recordName,
					}
				}
				break
			case 'setRecordingDestination':
				if (opt.source !== null && opt.destination !== null) {
					cmd = `sources/${opt.source}/destinations`
					type = 'PUT'
					params = opt.destination
				}
				break
		}
		this.sendCommand(cmd, type, params) // Execute command
	}

	setupPolling() {
		this.stopPolling()
		this.poll = setInterval(() => {
			this.sendCommand('sources', 'get')
			this.sendCommand('destinations', 'get')
		}, this.pollingInterval)
	}

	stopPolling() {
		if (this.poll) {
			clearInterval(this.poll)
			this.poll = null
		}
	}

	updateConfig(config) {
		let resetConnection = false

		this.debug('Updating config:', config)
		if (this.config.host != config.host) {
			resetConnection = true
		}
		if (this.config.port != config.port) {
			resetConnection = true
		}
		if (this.config.password != config.password) {
			this.password = config.password !== '' ? '?password=' + config.password : ''
			resetConnection = true
		}
		this.config = config
		debug('Reset connection', resetConnection)
		if (resetConnection === true) {
			this.status(this.STATUS_WARNING, 'Connecting')
			this.init()
		}
	}

	getSources() {
		this.sources = []
		this.sendCommand('sources', 'get')
	}

	sendCommand(cmd, type, params) {
		let url = `http://${this.config.host}:${this.config.port}/${cmd}${this.password}`
		let options = {}
		if (type == 'PUT' || type == 'POST') {
			options = {
				method: type,
				body: params != undefined ? JSON.stringify(params) : null,
				headers: { 'Content-Type': 'application/json' },
			}
		} else {
			options = {
				method: type,
				headers: { 'Content-Type': 'application/json' },
			}
		}

		fetch(url, options)
			.then((res) => {
				this.processStatus(res)
				if (res.status == 200) {
					return res.json()
				}
			})
			.then((json) => {
				let data = json
				if (data.success) {
					//ignore success messages that do not have data
				} else if (data.success === false) {
					this.log('warn', `Command failed: ${cmd}`)
				} else {
					this.processData(decodeURI(url), data)
				}
			})
			.catch((err) => {
				this.debug(err)
				let errorText = String(err)
				if (errorText.match('ECONNREFUSED')) {
					if (this.errorCount < 1) {
						this.status(this.STATUS_ERROR)
						this.log('error', 'Unable to connect to MovieRecorder')
					}
					if (this.errorCount > 60 && this.pollingInterval == 1000) {
						this.pollingInterval = 5000
						this.setupPolling()
					}
					this.errorCount++
				} else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
					if (this.timeOut < 1) {
						this.status(this.STATUS_ERROR)
						this.log('error', 'Unable to connect to MovieRecorder')
						this.timeOut++
					}
				}
			})
	}

	processStatus(result) {
		if (result.status !== undefined) {
			switch (result.status) {
				case 200: // OK
					if (this.errorCount > 0 || this.awaitingConnection == true) {
						this.errorCount = 0
						this.awaitingConnection = false
						this.pollingInterval = 1000
						this.setupPolling()
						this.status(this.STATUS_OK)
						this.log('info', 'Connected to MovieRecorder')
					}
					break
				case 201: // Created
					this.status(this.STATUS_OK)
					this.log('debug', 'Created: ' + res.statusText)
					break
				case 202: // Accepted
					this.status(this.STATUS_OK)
					this.log('debug', 'Accepted: ' + res.statusText)
					this.debug('Accepted: ', result.status)
					break
				case 400: // Bad Request
					this.log('warn', 'Bad request: ' + res.statusText)
					break
				case 401: // Authentication Failed
					this.status(this.STATUS_ERROR)
					if (this.errorCount == 0) {
						this.log('error', 'Authentication failed. Please check your password settings')
					}
					this.errorCount++
					break
				case 404: // Not found
					this.log('warn', 'Not found: ' + res.statusText)
					break
				case 422: // Unprocessable entity
					this.log('warn', 'Unprocessable entity: ' + res.statusText)
					break
				default:
					// Unexpected response
					this.status(this.STATUS_ERROR)
					this.log('error', 'Unexpected HTTP status code: ' + res.statusText)
					break
			}
		} else {
			this.log('warn', 'Unable to determine status')
		}
		if (this.errorCount > 60 && this.pollingInterval == 1000) {
			this.pollingInterval = 5000
			this.setupPolling()
		}
	}

	processData(cmd, data) {
		if (cmd.match('/sources') && data) {
			let originalSourceCount = Object.keys(this.sources).length
			let newSourceCount = Object.keys(data).length

			this.sources = data
			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalSourceCount != newSourceCount) {
				this.actions()
				this.initFeedbacks()
				this.updateVariableDefinitions()
				this.initPresets()
			}
		} else if (cmd.match('/destinations') && data) {
			let originalDestinationCount = Object.keys(this.destinations).length
			let newDestinationCount = Object.keys(data).length

			this.destinations = data
			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalDestinationCount != newDestinationCount) {
				this.actions()
				this.initFeedbacks()
				this.updateVariableDefinitions()
				this.initPresets()
			}
		}
	}
}

exports = module.exports = instance
