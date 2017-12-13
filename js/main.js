const myVert = require('./../shader/sample.vert');
const myFrag = require('./../shader/sample.frag');

let notWebGL = function () {
    // webGL非対応時の記述
    console.log('this browser does not support webGL')
};

if (document.getElementsByTagName('html')[0].classList.contains('no-webgl')) {
    notWebGL();
}

// three.jsのとき
try {
    let renderer = new THREE.WebGLRenderer();
} catch (e) {
    notWebGL();
}

// 返ってくる値を確認してみましょう！
console.log(ubu.detect);
// IEの時
if (ubu.detect.browser.ie) {
    console.log('IEさん、動画テクスチャはちょっと…無理ですね…')
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