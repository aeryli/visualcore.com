"use strict";

var camera, scene, mesh;
var renderCanvas, renderer;
var xrSession = null;
var xrRefSpace = null;

window.addEventListener("load", function() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
            if (supported) {
                initScene();
                initRenderer();
                
                document.getElementById("start").addEventListener("click", function(e) {
                    if (e.charCode == 'f'.charCodeAt(0) && !xrSession) {
                        navigator.xr.requestSession('immersive-vr').then(onXRSessionStarted);
                    }
                }, false);
            }
        });
    }
}, false);

function onXRSessionStarted(session) {
    xrSession = session;
    // Bind WebGL context to the WebXR session
    xrSession.updateRenderState({
        baseLayer: new XRWebGLLayer(xrSession, renderer.getContext())
    });

    xrSession.requestReferenceSpace('local').then(function(refSpace) {
        xrRefSpace = refSpace;
        // WebXR sessions drive animation via their own requestAnimationFrame
        xrSession.requestAnimationFrame(render);
    });
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
}

function render(time, frame) {
    if (xrSession) {
        xrSession.requestAnimationFrame(render);

        // Retrieve pose relative to the reference space instead of vrHMDSensor.getState()
        if (frame) {
            var pose = frame.getViewerPose(xrRefSpace);
            if (pose) {
                var view = pose.views[0];
                var orientation = view.transform.orientation;
                camera.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
            }
        }
    } else {
        requestAnimationFrame(render);
    }

    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}
