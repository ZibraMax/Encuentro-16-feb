import { GLTFViewer } from "./mii_model.js";
import { WebCamFilters } from "./WebcamFilters.js";
const elems = document.body.getElementsByTagName("figcaption");
for (let i = 0; i < elems.length; i++) {
	const element = elems[i];
	element.innerHTML = `<strong>Fig ${i + 1}. </strong>` + element.innerHTML;
}

let notes = false;
const config = {
	history: true,
	katex: {
		version: "latest",
		delimiters: [
			{ left: "$$", right: "$$", display: true },
			{ left: "$", right: "$", display: false },
			{ left: "\\(", right: "\\)", display: false },
			{ left: "\\[", right: "\\]", display: true },
		],
		ignoredTags: ["script", "noscript", "style", "textarea", "pre"],
	},
	// showNotes: true,
	slideNumber: null,
	transition: "fade",
	preloadIframes: true,
	showNotes: notes,
	viewDistance: 1,
	touch: false,
	width: 1100,
	height: 700,
	progress: false,

	navigationMode: "linear",
	plugins: [RevealMath.KaTeX, RevealNotes, RevealZoom, RevealMenu],
	menu: {
		side: "left",
		themes: true,
		themesPath: "css/theme/",
	},
	toolbar: { fullscreen: true },
	dependencies: [{ src: "plugin/toolbar/toolbar.js" }],
};
Reveal.initialize(config);

let queryString = window.location.search;
let theme = "white";
if (queryString != "") {
	queryString = queryString.split("?")[1];
	let parametros = new URLSearchParams(queryString);
	let theme_param = parametros.get("theme");
	if (theme_param) {
		theme = theme_param;
	}
}
function updateTheme() {
	const theme_link = document.getElementById("theme");
	theme_link.setAttribute("href", "css/theme/" + theme + ".css");
}

Reveal.addEventListener("menu-ready", function (event) {
	updateTheme();
});

// Reveal.configure({ pdfMaxPagesPerSlide: 1, showNotes: true });

const plots_config = { responsive: true, displayModeBar: false };
const plots_layout = {
	margin: { autoexpand: false, b: 0, l: 0, pad: 0, r: 0, t: 0 },
	paper_bgcolor: "rgba(0,0,0,0)",
	plot_bgcolor: "rgba(0,0,0,0)",
};

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
const mii_model_container = document.getElementById("mii_model");
const mii_model = new GLTFViewer(mii_model_container, 500, 600);
var p = mii_model.loadModel("./resources/3DModels/mii_gltf/", "mii.glb");

Reveal.on("mii_model", () => {
	p.then(() => {
		mii_model.onWindowResize();
		mii_model.setCamPos(
			0.01523827259889945,
			-2.617248957815932,
			0.9648668548278112,
			0.01523827259889945,
			-0.0012016982056230637,
			0.9648642383738599
		);
		sleep(2000).then(() => {
			mii_model.setAction(0);
			sleep(4000).then(() => {
				mii_model.setAction(1);
			});
		});
	});
});

let yaPasoCamera = false;
const canvasNormal = document.getElementById("cameraFeedNormal");
const canvasCamera = document.getElementById("cameraFeed");
const webcam = new WebCamFilters(canvasCamera, 500);

const webcamNormal = new WebCamFilters(canvasNormal, 500);

const videoSelect = document.getElementById("videoSource");
videoSelect.onchange = () => {
	webcam.getStream();
	webcamNormal.getStream();
};

Reveal.on("webcam", () => {
	if (!yaPasoCamera) {
		webcam.start();
		webcamNormal.start();
		yaPasoCamera = true;
	}
	sleep(3000).then(() => {
		webcam.set_filter(1);
		sleep(3000).then(() => {
			webcam.set_filter(2);
			sleep(3000).then(() => {
				webcam.set_filter(0);
			});
		});
	});
});
