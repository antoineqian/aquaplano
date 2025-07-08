#define PI 3.141592653589793
#define PI2 6.283185307179586
uniform float uSize;
uniform vec2 uMouse;
uniform vec3 uColors[2];
uniform sampler2D uParticlesTexture;
uniform vec2 uResolution;
attribute vec2 aParticlesUv;
attribute vec2 aMeshUv;
attribute float aParticlesSize;
attribute vec3 aParticlesColor;
attribute vec3 aNormal;
varying vec3 vColor[2];
varying vec3 vPosition;
varying float vParticlesAlpha;
varying vec2 vMeshUv;
varying vec3 vNormal;
varying vec3 vParticleTexture;

void main() {
    vec4 particle = texture2D(uParticlesTexture, aParticlesUv);
    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    /* Point Size */
    float lifeSize = smoothstep(0.0, 1.0, sin(particle.a * PI));

    gl_PointSize = aParticlesSize * lifeSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
    
    /* Variables to the fragment Shader */
    vColor = uColors;
    vPosition = position.xyz;
    vParticlesAlpha = particle.a;
    vParticleTexture = particle.xyz;
    vMeshUv = aMeshUv;
    vNormal = aNormal;
}