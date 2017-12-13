precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uResolution;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main(){

    vec2 pos = (gl_FragCoord.xy * 2. - uResolution) /min(uResolution.x,uResolution.y);

    vec2 u = vUv;

    vec4 color = texture2D(uTex, u); 
    
    //走査線
    float scanLine = abs(sin(u.y * 600.0 + uTime * 5.0)) * 0.5 + 0.5;
    color += scanLine;
    
    //ノイズ
    float noise = random(gl_FragCoord.xy + mod(uTime, 10.0));
    color *= noise * 0.5 + 0.5;

    //ノイズ2
    float noise2 = dot(gl_FragCoord.xy, vec2(sqrt(gl_FragCoord.x) * mod(uTime, 10.0)));
    color *= vec4(cos(noise2), vec2(sin(noise2)), 0.5)  * 0.5 + 0.5;

    //四隅を暗く
    float vignette = 1.5 - length(u);
    color *= vignette;

    //グリッジノイズ
    float r = random(vec2(u.y * .001, mod(uTime * 50.,1000.0))); 
    if (r < 0.1) {
        u.x += r * .2;
    }

    if (r < .01) {
        gl_FragColor.r += texture2D(uTex, u  + vec2(.03, 0.)).b; 
        gl_FragColor.b += texture2D(uTex, u  - vec2(.03, 0.)).g; 
    }
    
    else{
          gl_FragColor.r = texture2D(uTex, u  + vec2(.0025, 0.)).r ; 
          gl_FragColor.g = texture2D(uTex, u  - vec2(.0025, 0.005)).g; 
          gl_FragColor.b = texture2D(uTex, u + vec2(0,0.005) ).b; 

          gl_FragColor *= color + 0.7;
    }



}