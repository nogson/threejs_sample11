(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var myVert = require('./../shader/sample.vert');
var myFrag = require('./../shader/sample.frag');

var notWebGL = function notWebGL() {
    // webGL非対応時の記述
    console.log('this browser does not support webGL');
};

if (document.getElementsByTagName('html')[0].classList.contains('no-webgl')) {
    notWebGL();
}

// three.jsのとき
try {
    var renderer = new THREE.WebGLRenderer();
} catch (e) {
    notWebGL();
}

// 返ってくる値を確認してみましょう！
console.log(ubu.detect);
// IEの時
if (ubu.detect.browser.ie) {
    console.log('IEさん、動画テクスチャはちょっと…無理ですね…');
}

window.onload = function () {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var aspect = windowWidth / windowHeight;

    var clock = new THREE.Clock();
    var time = 0.0;

    // rendererの作成
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor('#CCC');

    // canvasをbodyに追加
    document.body.appendChild(renderer.domElement);

    // canvasをリサイズ
    renderer.setSize(windowWidth, windowHeight);

    // scene作成
    var scene = new THREE.Scene();
    // camera作成
    var camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
    camera.position.z = 1;

    // Geometry作成
    var geometry = new THREE.TorusBufferGeometry(0.25, 0.1, 16, 20);

    var video = document.createElement('video');
    video.src = "movie/mv.mp4";
    video.load();
    video.play();

    var uniforms = {
        'uTex': {
            type: 't',
            value: new THREE.VideoTexture(video)
        },
        'uTime': {
            type: 'f',
            value: time
        },
        'uResolution': {
            type: 'v2',
            value: new THREE.Vector2(windowWidth, windowHeight)
        }
    };

    //Geometryを作成
    var geometry = new THREE.BufferGeometry();

    //頂点座標
    var vertices = new Float32Array([-1.0 * aspect, 1.0, 0.0, 1.0 * aspect, 1.0, 0.0, -1.0 * aspect, -1.0, 0.0, 1.0 * aspect, -1.0, 0.0]);

    //頂点インデックス
    var index = new Uint32Array([0, 2, 1, 1, 2, 3]);

    var uvs = new Float32Array([0.0, 1.0, //1つ目の頂点のUV座標
    1.0, 1.0, //2つ目の頂点のUV座標
    0.0, 0.0, //3つ目の頂点のUV座標
    1.0, 0.0 //4つ目の頂点のUV座標
    ]);

    //頂点座標
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    //テクスチャ座標
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    //頂点のつなげ順
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    //マテリアルを設定。シェーダーファイルや、uniform変数を指定
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: myVert,
        fragmentShader: myFrag
    });

    var mesh = new THREE.Mesh(geometry, material);

    // Meshをシーンに追加
    scene.add(mesh);
    render();

    function render() {
        material.uniforms.uTex.value.needsUpdate = true;

        time = clock.getElapsedTime();
        material.uniforms.uTime.value = time;

        // draw
        renderer.render(scene, camera);

        window.requestAnimationFrame(render);
    }
};

},{"./../shader/sample.frag":2,"./../shader/sample.vert":3}],2:[function(require,module,exports){
module.exports = "precision mediump float;\nvarying vec2 vUv;\nuniform sampler2D uTex;\nuniform float uTime;\nuniform vec2 uResolution;\n\nfloat random (vec2 st) {\n    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);\n}\n\nvoid main(){\n\n    vec2 pos = (gl_FragCoord.xy * 2. - uResolution) /min(uResolution.x,uResolution.y);\n\n    vec2 u = vUv;\n\n    vec4 color = texture2D(uTex, u); \n    \n    //走査線\n    float scanLine = abs(sin(u.y * 600.0 + uTime * 5.0)) * 0.5 + 0.5;\n    color += scanLine;\n    \n    //ノイズ\n    float noise = random(gl_FragCoord.xy + mod(uTime, 10.0));\n    color *= noise * 0.5 + 0.5;\n\n    //ノイズ2\n    float noise2 = dot(gl_FragCoord.xy, vec2(sqrt(gl_FragCoord.x) * mod(uTime, 10.0)));\n    color *= vec4(cos(noise2), vec2(sin(noise2)), 0.5)  * 0.5 + 0.5;\n\n    //四隅を暗く\n    float vignette = 1.5 - length(u);\n    color *= vignette;\n\n    //グリッジノイズ\n    float r = random(vec2(u.y * .001, mod(uTime * 50.,1000.0))); \n    if (r < 0.1) {\n        u.x += r * .2;\n    }\n\n    if (r < .01) {\n        gl_FragColor.r += texture2D(uTex, u  + vec2(.03, 0.)).b; \n        gl_FragColor.b += texture2D(uTex, u  - vec2(.03, 0.)).g; \n    }\n    \n    else{\n          gl_FragColor.r = texture2D(uTex, u  + vec2(.0025, 0.)).r ; \n          gl_FragColor.g = texture2D(uTex, u  - vec2(.0025, 0.005)).g; \n          gl_FragColor.b = texture2D(uTex, u + vec2(0,0.005) ).b; \n\n          gl_FragColor *= color + 0.7;\n    }\n\n\n\n}";

},{}],3:[function(require,module,exports){
module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

},{}]},{},[1]);
