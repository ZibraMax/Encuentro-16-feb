import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
class GLTFViewer {
	constructor(container, width, height) {
		this.prevTime = 0;
		this.container = container;
		this.container.innerWidth = width;
		this.container.innerHeight = height;
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.00001,
			1000000
		);
		this.camera.position.z = 0;
		this.camera.position.x = 0;
		this.camera.position.y = -200;

		this.scene = new THREE.Scene();

		this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.ambientLight);

		this.pointLight = new THREE.PointLight(0xffffff, 10);
		this.camera.add(this.pointLight);
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			container,
			antialias: true,
			alpha: true,
			logarithmicDepthBuffer: true,
		});
		this.renderer.setSize(
			this.container.innerWidth,
			this.container.innerHeight
		);
		this.container.appendChild(this.renderer.domElement);
		window.addEventListener("resize", this.onWindowResize.bind(this));
		this.controls = new OrbitControls(this.camera, this.container);
		this.controls.target.set(0, 0, 0);
		this.controls.update();
		this.controls.addEventListener("change", () => {
			this.render();
			console.log(this.camera, this.controls);
		});
	}
	onWindowResize() {
		this.camera.aspect =
			this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(
			this.container.innerWidth,
			this.container.innerHeight
		);
	}

	loadModel(modelPath, modelName) {
		let O = this;
		const loader = new GLTFLoader().setPath(modelPath);
		return loader
			.loadAsync(modelName, this.onProgress.bind(this))
			.then(function (gltf) {
				gltf.scene.rotation.x += 3.141592654 / 2;
				gltf.scene.scale.set(10, 10, 10);
				O.mixer = new THREE.AnimationMixer(gltf.scene);
				O.animations = [];
				for (const animation of gltf.animations) {
					O.animations.push(O.mixer.clipAction(animation));
				}
				O.scene.add(gltf.scene);
				O.group = gltf.scene;
				O.render();
				O.zoomExtents();
				O.render();
				O.animations[3].play();
				O.lastAction = O.animations[1];
				O.activeAction = O.animations[1];
				O.activeAction.play();
				O.setAction(1);
				console.log(O.animations);

				requestAnimationFrame(O.animate.bind(O));
			});
	}
	setCamPos(x, y, z, x1, x2, x3) {
		let newCameraPos = new THREE.Vector3(x, y, z);
		let newControlPos = new THREE.Vector3(x1, x2, x3);
		this.camera.position.copy(newCameraPos);
		this.controls.target.copy(newControlPos);
		this.controls.update();
		this.camera.lookAt(this.scene);
		this.render();
	}
	onProgress(e) {}
	render() {
		this.renderer.render(this.scene, this.camera);
	}
	zoomExtents() {
		let vFoV = this.camera.getEffectiveFOV();
		let hFoV = this.camera.fov * this.camera.aspect;

		let FoV = Math.min(vFoV, hFoV);
		let FoV2 = FoV / 2;

		let dir = new THREE.Vector3();
		this.camera.getWorldDirection(dir);
		let mesh = this.group.children[0].children[0];
		let bs = mesh.geometry.boundingSphere;
		let bsWorld = bs.center.clone();
		mesh.localToWorld(bsWorld);

		let th = (FoV2 * Math.PI) / 180.0;
		let sina = Math.sin(th);
		let R = bs.radius;
		let FL = R / sina;

		let cameraDir = new THREE.Vector3();
		this.camera.getWorldDirection(cameraDir);

		let cameraOffs = cameraDir.clone();
		cameraOffs.multiplyScalar(-FL * 1.5);
		let newCameraPos = bsWorld.clone().add(cameraOffs);

		this.camera.position.copy(newCameraPos);
		this.camera.lookAt(bsWorld);
		this.controls.target.copy(bsWorld);
		this.controls.update();
	}
	resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = Math.floor(canvas.clientWidth * pixelRatio);
		const height = Math.floor(canvas.clientHeight * pixelRatio);
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
	animate(time) {
		requestAnimationFrame(this.animate.bind(this));

		const dt = (time - this.prevTime) / 1000;

		this.controls.update();
		this.mixer && this.mixer.update(dt);
		if (this.resizeRendererToDisplaySize(this.renderer)) {
			const canvas = this.renderer.domElement;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
		}
		this.render();

		this.prevTime = time;
	}
	setAction(idx) {
		let toAction = this.animations[idx];
		if (toAction != this.activeAction) {
			this.lastAction = this.activeAction;
			this.activeAction = toAction;
			//lastAction.stop()
			this.lastAction.fadeOut(1);
			this.activeAction.reset();
			this.activeAction.fadeIn(1);
			this.activeAction.play();
		}
	}
}
export { GLTFViewer };
