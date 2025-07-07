uniform float uTime;
uniform sampler2D uMeshMap;
uniform int uShape; // 1: disc | 2: ring | 3: sphere | 4: square
uniform bool uHasLightSource;
uniform vec3 uLightSource;
uniform vec3 uLightSourceColor;
uniform float uLightSourceIntensity;
uniform bool uHasColors;
varying vec3 vColor[2];
varying float vParticlesAlpha;
varying vec2 vMeshUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vParticleTexture;

void main() {
    vec2 uv = gl_PointCoord.xy;
    vec3 diffuseMap = texture2D(uMeshMap, vMeshUv).rgb;
    float circle = 1.0;
    if (uShape == 1) {
    circle = 1.0-length(uv - vec2(0.5));
    circle = smoothstep(0.5, 0.51, circle);
    } 
    if (uShape == 2) {
    circle = length(uv - vec2(0.5));
    circle = smoothstep(0.4, 0.4+0.1, circle);
    circle -= smoothstep(0.6, 0.6+0.1, circle);
    }
    if (uShape == 3) {
        circle = length(uv - vec2(0.5));
        circle = smoothstep(0.5, 0.0, circle);
    }
    if(circle < 0.01) discard;
    /* Lighting */
    float light = 1.0;
    float lightIntensity = 1.0;
    float specular = 0.0;
    vec3 lightColor = vec3(1.0);
    if(uHasLightSource) {
    vec3 lightDir = normalize(uLightSource - vPosition);
    vec3 normal = normalize(vNormal);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    light = max(dot(normal, lightDir), 0.035);
    lightIntensity = 0.5 + uLightSourceIntensity;
    specular = pow(max(dot(viewDir, reflectDir), 0.0), 1.0);
    specular *= 0.5;
    lightColor = uLightSourceColor;
    }
    float circleSphere =  length(uv - vec2(0.5));
    circleSphere = smoothstep(1.0, 0.0, circleSphere);
    circleSphere = pow(circleSphere, 2.0);
    vec3 color = vec3(1.0);
    if (uHasColors) {
    float colorType = (uShape == 3) ? circleSphere  : smoothstep(0.0, 1.0, 1.0-vNormal.y);
    color = mix(vColor[0], vColor[1], colorType);
    } else {
    color = diffuseMap;
    }
    color *= lightColor;
    color *= (light * lightIntensity) + specular;
    //color = vParticleTexture;

    gl_FragColor.rgba = vec4(color, 1.0);
}