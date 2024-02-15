function dist(x1, y1, x2, y2) {
	return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

class WebCamFilters {
	constructor(canvas, w) {
		this.canvas = canvas;
		this.strength = 5;
		this.filters = [
			this.base.bind(this),
			this.blur_filter.bind(this),
			this.glaucomaFilter.bind(this),
		];
		this.activeFilter = this.filters[0];
		this.videoElement = document.createElement("video", "");
		this.videoElement.setAttribute("autoplay", "");
		this.videoElement.setAttribute("muted", "");
		this.videoElement.setAttribute("playsinline", "");
		this.context = this.canvas.getContext("2d");
		this.videoSelect = document.querySelector("select#videoSource");
		this.videoSelect.onchange = this.getStream.bind(this);
		this.w = w;
		this.h = 100;
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.opts = { x: 0, y: 0, ctx: this.context };
	}

	snapshot() {
		let w = this.videoElement.videoWidth;
		let h = this.videoElement.videoHeight;
		let ratio = h / w;
		this.h = this.w * ratio;
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.context.fillRect(0, 0, this.w, this.h);
		this.context.drawImage(this.videoElement, 0, 0, this.w, this.h);
		try {
			return this.context.getImageData(0, 0, this.w, this.h);
		} catch (error) {}
	}

	async draw() {
		var image = this.snapshot();
		this.canvas.style.filter = "blur(" + 0 + "px)";
		try {
			let res = await this.activeFilter(image, this.opts);
			if (res) {
				this.context.putImageData(image, 0, 0);
			}
		} catch (error) {
			console.log(error);
		}
		requestAnimationFrame(this.draw.bind(this));
	}

	async base(image, opts) {
		return true;
	}

	set_filter(idx) {
		this.activeFilter = this.filters[idx];
	}
	set_strength(strength) {
		this.strength = strength;
	}

	gotStream(stream) {
		window.stream = stream; // make stream available to console
		this.videoSelect.selectedIndex = [
			...this.videoSelect.options,
		].findIndex(
			(option) => option.text === stream.getVideoTracks()[0].label
		);
		this.videoElement.srcObject = stream;
	}
	async getStream() {
		if (window.stream) {
			window.stream.getTracks().forEach((track) => {
				track.stop();
			});
		}
		const videoSource = this.videoSelect.value;
		const constraints = {
			audio: false,
			video: {
				deviceId: videoSource ? { exact: videoSource } : undefined,
			},
		};

		return navigator.mediaDevices
			.getUserMedia(constraints)
			.then(this.gotStream.bind(this))
			.then(() => {
				this.draw();
			})
			.catch(this.handleError.bind(this));
	}
	handleError(e) {
		console.log(e);
	}

	getDevices() {
		return navigator.mediaDevices.enumerateDevices();
	}
	gotDevices(deviceInfos) {
		window.deviceInfos = deviceInfos; // make available to console
		console.log("Available input and output devices:", deviceInfos);
		for (const deviceInfo of deviceInfos) {
			const option = document.createElement("option");
			option.value = deviceInfo.deviceId;
			if (deviceInfo.kind === "videoinput") {
				option.text =
					deviceInfo.label || `Camera ${videoSelect.length + 1}`;
				this.videoSelect.appendChild(option);
			}
		}
	}

	async blur_filter(image, opts) {
		this.canvas.style.filter = "blur(" + this.strength + "px)";
		return true;
	}

	async glaucomaFilter(image, opts) {
		let cx = this.w / 2;
		let cy = this.h / 2;
		let maxdist = dist(cx, cy, 0, 0);
		for (var i = 0, l = image.data.length; i < l; i += 4) {
			let pixidx = ~~(i / 4);
			var row = ~~(pixidx / this.h);
			let col = pixidx % this.w;
			let f =
				1 - (dist(cx, cy, col, row) / maxdist) * (this.strength / 5);
			image.data[i] = image.data[i] * f;
			image.data[i + 1] = image.data[i + 1] * f;
			image.data[i + 2] = image.data[i + 2] * f;
		}
		this.context.putImageData(image, 0, 0);
		return true;
	}

	start() {
		this.getStream()
			.then(this.getDevices.bind(this))
			.then(this.gotDevices.bind(this));
	}
}

export { WebCamFilters };
