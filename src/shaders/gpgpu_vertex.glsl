#define PI 3.141592653589793
#define PI2 6.283185307179586
#include ./includes/simplexNoise4d.glsl

uniform float uTime;
uniform float uDeltaTime;
uniform vec3 uMouse;
uniform float uMouseDelta;
uniform float uDisturbIntensity;
uniform float uRepulsionForce;
uniform bool uInteractive;
uniform sampler2D uBaseParticlesTexture;

void main() {
// resolution + uParticles are given by the GPUComputationRenderer
vec2 uv = gl_FragCoord.xy / resolution.xy;
vec4 particle =  texture2D(uParticles, uv);
vec4 baseParticle = texture2D(uBaseParticlesTexture, uv);
float uRepelStrength = clamp(uMouseDelta, 0.0, uRepulsionForce);
vec3 particlePos = particle.xyz;
vec3 mousePos = uMouse.xyz;
vec3 dir = normalize(particlePos - mousePos);
float dist = distance(mousePos, particlePos);
float repulsionForce = uRepelStrength / (dist * (dist + 1.0));
vec3 repulsion = dir * repulsionForce;

if(uInteractive){
    particle.xyz += repulsion * uRepelStrength;
}
if (particle.a >= 1.0) {
    particle.a = mod(particle.a, 1.0); 
    particle.xyz = baseParticle.xyz;
} 
else {
    float disturbIntensity = (uDisturbIntensity > 0.0) ? pow(uDisturbIntensity, 2.0) : 0.0;
    float timer = uDeltaTime;
    float strength = 0.01;

    float flowZ = -0.03;
    float flowX = sin(particle.z * 0.15 + particle.x * 0.5 + uTime) * 0.01;
    float flowY = sin(particle.z * 0.3 + particle.y * 0.5 + uTime) * 0.005;

    vec3 noiseFlow = vec3(
        simplexNoise4d(vec4(particle.xyz, uTime)),
        simplexNoise4d(vec4(particle.yxz, uTime)),
        simplexNoise4d(vec4(particle.zxy, uTime))
    ) * 0.003;

    vec3 flowField = vec3(flowX, flowY, flowZ) + noiseFlow;

    float baseSpeed = 0.03 + sin(particle.z * 0.05 + particle.x) * 0.01;

    // Forward flow (Z axis)
    particle.z -= baseSpeed * uDeltaTime;

    // Curving left and right
    particle.x += sin(particle.z * 0.15 + particle.x * 0.2 + uTime) * 0.01;

    // Up/down bouncing
    particle.y += sin(particle.z * 0.3 + particle.x * 0.3 + uTime) * 0.005;

    // Clamp Y
    particle.y = max(0.1, particle.y);

    // Wrap Z to reset when out of view (simulate infinite river)
    if (particle.z < -10.0) {
        particle.z = 10.0;
        particle.x = (fract(sin(dot(particle.xy ,vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 4.0;
        particle.y = fract(sin(dot(particle.zy ,vec2(93.9898,67.345))) * 43758.5453);
    }
    if(disturbIntensity > 0.0){
        particle.xyz += flowField * disturbIntensity * strength * particle.a;
        particle.a += uDeltaTime;
    } else {
        particle.a += uDeltaTime;
        particle.xyz += flowField;
    }
}
gl_FragColor.rgba = particle;
}