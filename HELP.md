## Softron MovieRecorder

Allows you to control [MovieRecorder](https://softron.tv/products/movierecorder) from Softron Media Services.

### Configuration

- In the MovieRecorder app > Preferences > General, enable "Remote Control" checkbox
- By default, MovieRecorder uses port 8080. You can change this if needed, just remember to edit the port in the module settings to match
- If you enable a password in MovieRecorder, you must provide a password in the module settings

### Available actions

- Record
- Pause (only available for destinations listed as "Classic" in MovieRecorder)
- Resume
- Stop
- Set Recording Name
- Set Recording Destinations

### Available feedback

- Recording Status

### Available variables

- rec_name (Current recording name of each source)
- rec_status (Current recording status of each source, including: recording, paused, stopped)
- rec_time (Elapsed recording time of each source)
- rec_destinations (Currently enabled recording destinations of each source)
