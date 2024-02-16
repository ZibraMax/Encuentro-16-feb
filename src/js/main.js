import { GLTFViewer } from "./mii_model.js";
import { GLTFViewerEye } from "./eye_model.js";
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
});

const abaqus_model_container = document.getElementById("model_abaqus");
const abaqus_model = new GLTFViewerEye(abaqus_model_container, 600, 600);
var p2 = abaqus_model.loadModel(
	"./resources/3DModels/model_abaqus/",
	"model_abaqus.glb"
);

Reveal.on("abaqus", () => {
	p2.then(() => {
		abaqus_model.onWindowResize();
		abaqus_model.setCamPos(
			-23.838344563765627,
			33.41596257121292,
			10.277514500806546,
			-1.096834527439133,
			-4.167616160273829,
			9.324362828283997
		);
		abaqus_model.resetAnimations();
	});
});
const activador = document.getElementById("activador_eye_1");
const activador2 = document.getElementById("activador_eye_2");
const activador3 = document.getElementById("activador_eye_3");
Reveal.on("fragmentshown", (event) => {
	if (event["fragment"] === activador) {
		webcam.set_filter(1);
	} else if (event["fragment"] === activador2) {
		webcam.set_filter(2);
	} else if (event["fragment"] === activador3) {
		abaqus_model.playAnimations([0, 1, 2, 3, 4, 5]);
	}
});
Reveal.on("fragmenthidden", (event) => {
	if (event["fragment"] === activador) {
		webcam.set_filter(0);
	} else if (event["fragment"] === activador2) {
		webcam.set_filter(1);
	} else if (event["fragment"] === activador3) {
		abaqus_model.resetAnimations();
	}
});
