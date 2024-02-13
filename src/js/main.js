//Selector for your <video> element
const videoElement = document.getElementById("glaucoma");
const videoElement2 = document.getElementById("normie");
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var audioSelect = document.querySelector("select#audioSource");
var videoSelect = document.querySelector("select#videoSource");

function gotStream(stream) {
	window.stream = stream; // make stream available to console
	audioSelect.selectedIndex = [...audioSelect.options].findIndex(
		(option) => option.text === stream.getAudioTracks()[0].label
	);
	videoSelect.selectedIndex = [...videoSelect.options].findIndex(
		(option) => option.text === stream.getVideoTracks()[0].label
	);
	videoElement.srcObject = stream;
	videoElement2.srcObject = stream;
}

function getStream() {
	if (window.stream) {
		window.stream.getTracks().forEach((track) => {
			track.stop();
		});
	}
	const audioSource = audioSelect.value;
	const videoSource = videoSelect.value;
	const constraints = {
		audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
		video: { deviceId: videoSource ? { exact: videoSource } : undefined },
	};
	return navigator.mediaDevices
		.getUserMedia(constraints)
		.then(gotStream)
		.then(() => {
			videoElement.draw.call(videoElement);
		})
		.catch(handleError);
}
function getDevices() {
	// AFAICT in Safari this only gets default devices until gUM is called :/
	return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
	window.deviceInfos = deviceInfos; // make available to console
	console.log("Available input and output devices:", deviceInfos);
	for (const deviceInfo of deviceInfos) {
		const option = document.createElement("option");
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === "audioinput") {
			option.text =
				deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
			audioSelect.appendChild(option);
		} else if (deviceInfo.kind === "videoinput") {
			option.text =
				deviceInfo.label || `Camera ${videoSelect.length + 1}`;
			videoSelect.appendChild(option);
		}
	}
}

async function drawBlured(image, opts) {
	let ctx = opts.ctx;
	let x = opts.x;
	let y = opts.y;
	let dx = opts.ammount;
	let dy = opts.ammount;
	var samples = 30; // the number of samples. The greater the number the
	dx /= samples; // divide the speed by the number of samples
	dy /= samples;
	ctx.globalAlpha = 1 / (samples / 1.2); // set the global alpha need to up the
	for (var i = 0; i < samples; i++) {
		ctx.putImageData(image, x + i * dx, y + i * dy); // moving it as we go
	}
	ctx.globalAlpha = 1; // restore alpha
	return false;
}

var flip = async function (image, opts) {
	var data = image.data,
		width = w,
		half = Math.floor(width / 2);
	for (var i = 0; i < data.length; i += 4) {
		var row = i - (i % width),
			x = width - (i % width),
			j = row + x;
		if (x < half) continue;
		var r = data[i],
			g = data[i + 1],
			b = data[i + 2];
		data[i] = data[j];
		data[i + 1] = data[j + 1];
		data[i + 2] = data[j + 2];
		data[j] = r;
		data[j + 1] = g;
		data[j + 2] = b;
	}
	return true;
};

function dist(x1, y1, x2, y2) {
	return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}
function sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
}
var dv = async function (image, opts) {
	ctx = opts.ctx;
	let cx = w / 2;
	let cy = h / 2;
	let maxdist = dist(cx, cy, 0, 0);
	for (var i = 0, l = image.data.length; i < l; i += 4) {
		let pixidx = ~~(i / 4);
		var row = ~~(pixidx / h);
		let col = pixidx % w;
		let f = 1 - (dist(cx, cy, col, row) / maxdist) * (opts.ammount / 5);
		image.data[i] = image.data[i] * f;
		image.data[i + 1] = image.data[i + 1] * f;
		image.data[i + 2] = image.data[i + 2] * f;
	}
	ctx.putImageData(image, 0, 0);
	return true;
};

var blur_filter = async function (image, opts) {
	canvas.style.filter = "blur(" + opts.ammount + "px)";
	return true;
};

var filter = dv;
function change_filter() {}
document.getElementById("cf").addEventListener("click", change_filter);

const opts = { ammount: 5, x: 0, y: 0, ctx: context };

videoElement.draw = async function () {
	var self = this;
	var image = snapshot();
	canvas.style.filter = "blur(" + 0 + "px)";
	try {
		let res = await filter(image, opts);
		if (res) {
			context.putImageData(image, 0, 0);
		}
	} catch (error) {
		console.log(error);
	}
	self.ticker = setTimeout(function () {
		self.draw.call(self);
	}, 25);
};

function handleError(error) {
	console.error("Error: ", error);
}

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

//w-width,h-height
var w = 100;
var h = 100;
canvas.width = w;
canvas.height = h;
canvas.style.display = "block";

//new
function snapshot() {
	w = videoElement.videoWidth;
	h = videoElement.videoHeight;
	canvas.width = w;
	canvas.height = h;
	context.fillRect(0, 0, w, h);
	context.drawImage(videoElement, 0, 0, w, h);
	try {
		return context.getImageData(0, 0, w, h);
	} catch (error) {}
}
getStream().then(getDevices).then(gotDevices);
