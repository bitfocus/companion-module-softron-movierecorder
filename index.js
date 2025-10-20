import { InstanceBase, Regex, runEntrypoint } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables, updateSourceVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'

import fetch from 'node-fetch'

class MovieRecorderInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateSourceVariables = updateSourceVariables
		this.thumbnailFeedbacks = new Map()
		this.thumbnailTimers = new Map() 
	}

	async init(config) {
		if (config) {
			this.config = config
		}

		this.sources = {}
		this.sourceList = []
		this.destinations = {}
		this.destinationList = []
		this.errorCount = 0

		this.updateStatus('connecting')
		this.errorCount = 0
		this.timeOut = 0
		this.pollingInterval = 5000
		this.awaitingConnection = true

		this.password = this.config?.password !== '' ? `?password=${this.config?.password}` : ''
		this.getSources()
		this.initActions()
		this.initVariables()
		this.initFeedbacks()
		this.initPresets()

		this.setupPolling()
	}

	async destroy() {
		this.sources = {}
		this.sourceList = []
		this.destinations = {}
		this.destinationList = []
		this.stopPolling()
		for (const timer of this.thumbnailTimers.values()) {
			clearInterval(timer)
		}
		this.thumbnailTimers.clear()
		this.thumbnailFeedbacks.clear()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				default: '127.0.0.1',
				width: 6,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				default: 8080,
				width: 2,
				regex: Regex.PORT,
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

	async configUpdated(config) {
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}
		if (this.config.port != config.port) {
			resetConnection = true
		}
		if (this.config.password != config.password) {
			this.password = config.password !== '' ? `?password=${this.config.password}` : ''
			resetConnection = true
		}
		this.config = config

		if (resetConnection === true) {
			this.updateStatus('connecting')
			this.init()
		}
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	setupPolling() {
		this.stopPolling()
		this.poll = setInterval(() => {
			this.sendCommand('sources', 'GET')
			this.sendCommand('destinations', 'GET')
			this.sendCommand('scheduled_recordings', 'GET')
		}, this.pollingInterval)
	}

	stopPolling() {
		if (this.poll) {
			clearInterval(this.poll)
			this.poll = null
		}
	}

	getSources() {
		this.sources = {}
		this.sendCommand('sources', 'GET')
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
				if (data?.success) {
					//ignore success messages that do not have data
				} else if (data?.success === false) {
					this.log('warn', `Command failed: ${data.error}`)
				} else {
					this.processData(decodeURI(url), data)
				}
			})
			.catch((err) => {
				let errorText = String(err)
				if (errorText.match('ECONNREFUSED')) {
					if (this.errorCount < 1) {
						this.updateStatus('connection_failure')
						this.log('error', 'Unable to connect to MovieRecorder')
					}
					if (this.errorCount > 60 && this.pollingInterval == 1000) {
						this.pollingInterval = 5000
						this.setupPolling()
					}
					this.errorCount++
				} else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
					if (this.timeOut < 1) {
						this.updateStatus('connection_failure')
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
						this.updateStatus('ok')
						this.log('info', 'Connected to MovieRecorder')
					}
					break
				case 201: // Created
					this.updateStatus('ok')
					this.log('debug', result.statusText)
					break
				case 202: // Accepted
					this.updateStatus('ok')
					this.log('debug', result.statusText)
					break
				case 400: // Bad Request
					this.log('warn', result.statusText)
					break
				case 401: // Authentication Failed
					this.updateStatus('bad_config')
					if (this.errorCount == 0) {
						this.log('error', 'Authentication failed. Please check your password settings')
					}
					this.errorCount++
					break
				case 404: // Not found
					this.log('warn', result.statusText)
					break
				case 422: // Unprocessable entity
					this.log('warn', result.statusText)
					break
				default:
					// Unexpected response
					this.updateStatus('unknown_error')
					this.log('error', result.statusText)
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
			this.sources = {}

			for (let s in data) {
				let source = data[s]
				this.sources[source.unique_id] = source
				this.sources[source.unique_id].scheduled = []
			}
			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalSourceCount != newSourceCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/destinations') && data) {
			let originalDestinationCount = Object.keys(this.destinations).length
			let newDestinationCount = Object.keys(data).length

			this.destinations = {}

			for (let s in data) {
				let destination = data[s]
				this.destinations[destination.unique_id] = destination
			}

			this.checkFeedbacks()
			this.updateSourceVariables()

			if (originalDestinationCount != newDestinationCount) {
				this.initActions()
				this.initFeedbacks()
				this.initVariables()
				this.initPresets()
			}
		} else if (cmd.match('/scheduled_recordings') && data) {
			let today = new Date()
			let weekday = today.getDay()
			let minutesElapsed = 60 * today.getHours() + today.getMinutes()
			this.currentRecordings = []
			this.nextRecording = []

			for (let s in data) {
				let scheduledRec = data[s]
				if (scheduledRec.is_enabled && scheduledRec.stopped_by_user != true && scheduledRec.source_unique_id) {
					if (scheduledRec.weekly_repeated && scheduledRec.recording_days.includes(weekday)) {
						this.sources[scheduledRec.source_unique_id]?.scheduled.push(scheduledRec)
					} else if (scheduledRec.date) {
						let recordingDate = new Date(scheduledRec.date)
						if (recordingDate.toLocaleDateString('en-US') == today.toLocaleDateString('en-US')) {
							this.sources[scheduledRec.source_unique_id]?.scheduled.push(scheduledRec)
						}
					}
				}
			}

			for (let s in this.sources) {
				let source = this.sources[s]
				let validSourceName = source.display_name?.replace(/[\W]/gi, '_')
				let upcomingSourceRecordings = []
				let currentSourceRecordings = []

				for (let s in this.sources[source.unique_id].scheduled) {
					let scheduledRec = this.sources[source.unique_id].scheduled[s]
					let recordingStartTime = scheduledRec.start_time
					let recordingEndTime = scheduledRec.start_time + scheduledRec.duration
					let recordingStartTimeHHMM = new Date(scheduledRec.start_time * 1000).toISOString().substr(14, 5)
					let dateType = /(\d{4})([\/-])(\d{1,2})\2(\d{1,2})._/
					let recName = scheduledRec.name
					if (dateType.test(scheduledRec.name)) {
						recName = scheduledRec.name.replace(dateType, '') //Removes date, if present, to help text space on button
					}
					let recordingInfo = `@ ${recordingStartTimeHHMM}\\n${recName}`

					if (recordingEndTime > minutesElapsed && recordingStartTime <= minutesElapsed) {
						this.currentRecordings[source.unique_id] = scheduledRec
						currentSourceRecordings.push(recName)
					} else if (recordingStartTime > minutesElapsed) {
						if (upcomingSourceRecordings.includes(recordingInfo) === false) {
							let recordingDetails = { name: recordingInfo, details: scheduledRec }
							upcomingSourceRecordings.push(recordingDetails)
						}
					}
				}

				if (currentSourceRecordings.length) {
					this.setVariableValues({
						[`scheduled_rec_${validSourceName}`]: currentSourceRecordings[0],
					})
				} else if (upcomingSourceRecordings.length) {
					upcomingSourceRecordings.sort((a, b) => a.name.localeCompare(b.name))
					this.nextRecording[source.unique_id] = upcomingSourceRecordings[0].details
					this.setVariableValues({ [`scheduled_rec_${validSourceName}`]: upcomingSourceRecordings[0].name })
				} else {
					this.setVariableValues({ [`scheduled_rec_${validSourceName}`]: 'None' })
				}
			}
		}
	}

	/**
	 * Subscribe to thumbnail feedback
	 * @param {Object} feedback - The feedback object
	 */
	subscribeThumbnailFeedback(feedback) {
		const feedbackId = feedback.id
		const interval = feedback.options.interval || 500

		this.log('debug', `Subscribing to thumbnail feedback ${feedbackId} with interval ${interval}ms`)

		// Store the feedback
		this.thumbnailFeedbacks.set(feedbackId, feedback)

		// Set up periodic refresh
		const timer = setInterval(() => {
			this.checkFeedbacks('sourceThumbnail')
		}, interval)

		this.thumbnailTimers.set(feedbackId, timer)

		// Trigger immediate update
		this.checkFeedbacks('sourceThumbnail')
	}

	/**
	 * Unsubscribe from thumbnail feedback
	 * @param {Object} feedback - The feedback object
	 */
	unsubscribeThumbnailFeedback(feedback) {
		const feedbackId = feedback.id

		this.log('debug', `Unsubscribing from thumbnail feedback ${feedbackId}`)

		// Clear the timer
		const timer = this.thumbnailTimers.get(feedbackId)
		if (timer) {
			clearInterval(timer)
			this.thumbnailTimers.delete(feedbackId)
		}

		// Remove the feedback
		this.thumbnailFeedbacks.delete(feedbackId)
	}

	/**
	 * Get the thumbnail image from the API
	 * @param {string} sourceId - The source unique ID
	 * @returns {Object} Image object for feedback
	 */
	async getThumbnailImage(sourceId) {
		try {
			const url = `http://${this.config.host}:${this.config.port}/sources/${sourceId}/thumbnail${this.password}`

			const response = await fetch(url)

			if (response.status === 200) {
				const buffer = await response.buffer()
				// Return the image in base64 format that Companion expects
				return {
					png64: buffer.toString('base64'),
				}
			}
		} catch (error) {
			this.log('warn', `Failed to fetch thumbnail: ${error.message}`)
		}

		return undefined
	}
}

runEntrypoint(MovieRecorderInstance, [])
