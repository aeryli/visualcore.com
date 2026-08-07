function runeggy() {
    var camera, scene, mesh;
    var renderCanvas, renderer, vrrenderer;
    var vrHMD, vrHMDSensor;

    renderCanvas = document.getElementById("render-canvas");

    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
            // WebXR immersive VR is supported; handle setup or show entry button
            vrDeviceCallback();
            } else {
                console.log("Immersive VR not supported");
            }
        });
    } else {
        console.log("WebXR not available");
    }

    window.addEventListener("keypress", function(e) {
        if (e.code == 'KeyF') {
            renderCanvas.requestFullscreen();
            console.log(e.code);
        }
    });
    document.getElementById("start").addEventListener("click", function(e) {
        renderCanvas.requestFullscreen();
        console.log(e.code);
    });

    function vrDeviceCallback(vrdevs) {
        for (var i = 0; i < vrdevs.length; ++i) {
            if (vrdevs[i] instanceof HMDVRDevice) {
                vrHMD = vrdevs[i];
                break;
            }
        }
        for (var i = 0; i < vrdevs.length; ++i) {
            if (vrdevs[i] instanceof PositionSensorVRDevice &&
                vrdevs[i].hardwareUnitId == vrHMD.hardwareUnitId) {
                vrHMDSensor = vrdevs[i];
                break;
            }
        }
        initScene();
        initRenderer();
        render();
    }

    function initScene() {
        camera = new THREE.PerspectiveCamera(60, 1280 / 800, 0.001, 10);
        camera.position.z = 2;
        scene = new THREE.Scene();
        var geometry = new THREE.IcosahedronGeometry(1, 1);
        var material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    function initRenderer() {
        renderCanvas = document.getElementById("render-canvas");
        renderer = new THREE.WebGLRenderer({
            canvas: renderCanvas,
        });
        renderer.setClearColor(0x555555);
        renderer.setSize(1280, 800, false);
        vrrenderer = new THREE.VRRenderer(renderer, vrHMD);
    }

    function render() {
        requestAnimationFrame(render);
        mesh.rotation.y += 0.01;
        var state = vrHMDSensor.getState();
        camera.quaternion.set(state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w);
        vrrenderer.render(scene, camera);
    }
}
