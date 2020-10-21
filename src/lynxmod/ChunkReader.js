/**
 * ChunkReader
 * https://github.com/mgmeyers/ChunkReader
 *
 * Copyright 2014 Matthew Meyers <hello@matthewmeye.rs>
 * Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Reads a file one line at a time.
 *
 * @param {Object} options -- options for the line reader
 *
 * Available options:
 *	 chunkSize {Integer} -- how much of the file to read at a time
 */

 export default {
	name: 'ChunkReader',
	data() {
    return {
      _internals: {},
    }
	},
	methods:{
		ChunkReader:async function(options) {

		/**
		 * We'll use '_internals' to store data we don't want public facing
		 *
		 * We'll also need a reference to 'this', as it will be overridden in the
		 * 'onload' and 'onerror' events
		 */
		this._internals = {};
		var self = this;

		/**
		 * Let's create a 'FileReader' instance, we'll only need one per 'ChunkReader'
		 * instance
		 */
		this._internals.reader = new FileReader()

		/**
		 * If 'chunkSize' has been set by the user, use that value, otherwise,
		 * default to 1024
		 */
		this._internals.chunkSize = options && options.chunkSize ? options.chunkSize : 1024

		/**
		 * Let's create an object to house user defined event callbacks
		 */
		this._internals.events = {}

		/**
		 * 'canRead' will be set to false if the ChunkReader#abort method is fired
		 */
		this._internals.canRead = true

		/**
		 * FileReader#onload' event. This gets called when any read operations have
		 * completed
		 */
		this._internals.reader.onload = function() {
			/**
			 * Store the processed text by tagging it on to any existing processed text
			 * 'this' refers to our 'FileReader' instance
			 */
			self._internals.chunk += this.result

			/**
			 * If the processed text contains a newline character
			 */
			if (/\r|\n/.test(self._internals.chunk)) {
				/**
				 * Split the text into an array of lines
				 */
				self._internals.lines = self._internals.chunk.split(/\n/g)

				/**
				 * If there is still more data to read, save the last line, as it may be
				 * incomplete
				 */
				if (self._hasMoreData()) {
					/**
					 * If the loaded chunk ends with a newline character then the last line
					 * is complete and we don't need to store it
					 */
					self._internals.chunk =
						self._internals.chunk[self._internals.chunk.length - 1] === '\n'
							? ''
							: self._internals.lines.pop()
				}

				/**
				 * Start stepping through each line
				 */
				self._step()

				/**
				 * If the text did not contain a newline character
				 */
			} else {
				/**
				 * Start another round of the read process if there is still data to read
				 */
				if (self._hasMoreData()) {
					return self.read()
				}

				/**
				 * If there is no data left to read, but there is still data stored in
				 * 'chunk', emit it as a line
				 */
				if (self._internals.chunk.length) {
					return self._emit('line', [
						self._internals.chunk,
						self._emit.bind(self, 'end'),
					])
				}

				/**
				 * if there is no data stored in 'chunk', emit the end event
				 */
				self._emit('end')
			}
		}

		/**
		 * 'FileReader#onerror' event. This gets called any time there is an error
		 * reading a file
		 */
		this._internals.reader.onerror = function() {
			/**
			 * Emit the error event, passing along the error object to the callback
			 * 'this' refers to our 'FileReader' instance
			 */
			self._emit('error', [this.error])
		}
	},

/**
 * ChunkReader#on
 *
 * Binds events
 *
 * @param {String} eventName -- the name of the event to bind to
 * @param {Function} cb -- the function to execute when the event is triggered
 */
	on: function(eventName, cb) {
		this._internals.events[eventName] = cb
	},

/**
 * ChunkReader#read
 *
 * Starts the read process
 *
 * @param {File} file -- The file reference to process
 */
	read: function(file) {

			/**
			 * If 'file' is defined, then we want to get some information about it and
			 * reset 'readPos', 'chunk', and 'lines'
			 */
			if (typeof file !== 'undefined') {
				this._internals.file = file
				this._internals.fileLength = file.size
				this._internals.readPos = 0
				this._internals.chunk = ''
				this._internals.lines = []
			}

			/**
			 * Extract a section of the file for reading starting at 'readPos' and
			 * ending at 'readPos + chunkSize'
			 */
			var blob = this._internals.file.slice(
				this._internals.readPos,
				this._internals.readPos + this._internals.chunkSize
			)

			/**
			 * Update our current read position
			 */
			this._internals.readPos += this._internals.chunkSize

			/**
			 * Read the blob as binary string so we can stitch up any broken multi-byte
			 * chars
			 */
			this._internals.reader.readAsBinaryString(blob)
		},

	/**
	 * ChunkReader#abort
	 *
	 * Stops the read process
	 */
		abort: function() {
			this._internals.canRead = false
		},

	/**
	 * ChunkReader#_step
	 *
	 * Internal: gets the next line and emits it as a `line` event
	 */
		_step: function() {
			/**
			 * If there are no lines left to emit and there is still data left to read,
			 * start the read process again, otherwise, emit the 'end' event
			 */
			if (this._internals.lines.length === 0) {
				if (this._hasMoreData()) {
					return this.read()
				}
				return this._emit('end')
			}

			/**
			 * If the reading process hasn't been aborted, emit the first element of the
			 * line array, and pass in '_step' for the user to call when they are ready
			 * for the next line. We have to bind '_step' to 'this', otherwise it will be
			 * in the wrong scope when the user calls it
			 */
			if (this._internals.canRead) {
        let line = this._internals.lines.join('\n');
				this._internals.lines = [];
				//let line = this._internals.lines.shift();
        let decoded = line;
        try {
          /**
           * Reconstruct any broken multi-byte chars
           */
          decoded = decodeURIComponent(escape(line))
        } catch (e) {
          console.error(e);
        }
				this._emit('line', [
					decoded,
					this._step.bind(this),
				])
			} else {
				/**
				 * If we can't read, emit the 'end' event
				 */
				this._emit('end')
			}
		},

	/**
	 * ChunkReader#_hasMoreData
	 *
	 * Internal: determines if there is still more data to read.
	 */
		_hasMoreData: function() {
			return this._internals.readPos <= this._internals.fileLength
		},

	/**
	 * ChunkReader#_emit
	 *
	 * Internal: handles event emissions
	 *
	 * @param	{String} event -- The event name to emit
	 * @param	{Array} args -- An array of arguments to send to the event callback
	 */
		_emit: function(event, args) {
			var boundEvents = this._internals.events

			/**
			 * if the user has bound the requested event
			 */
			if (typeof boundEvents[event] === 'function') {
				/**
				 * Use apply to ensure correct scope, and pass in the 'args' array to
				 * be used as arguments for the callback
				 */
				boundEvents[event].apply(this, args)
			}
		},
    GetReadPos: function(){
      return this._internals.readPos;
    }
	}
}
