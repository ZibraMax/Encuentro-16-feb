import { GLTFViewer } from "./mii_model.js";
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
let theme = "black";
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
Reveal.on("mii_model", () => {
	const mii_model_container = document.getElementById("mii_model");
	const mii_model = new GLTFViewer(mii_model_container, 400, 600);
	mii_model
		.loadModel("./resources/3DModels/mii_gltf/", "mii.glb")
		.then(() => {
			mii_model.onWindowResize();
			mii_model.setCamPos(
				0.021778356863911674,
				-2.608167847570856,
				1.504572492453016,
				0.021778342784509318,
				-0.28520274484813496,
				1.5045701691694453
			);
		});
});
