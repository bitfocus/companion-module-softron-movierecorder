export const upgradeScripts = [
	function (context, props) {
		//v2.4.0
		//add useHttps to config
		let changed = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		if (props.config !== null) {
			let config = props.config
			if (config.useHttps === undefined) {
				config.useHttps = false
				changed.updatedConfig = config
			}
		}
		return changed
	},
]
