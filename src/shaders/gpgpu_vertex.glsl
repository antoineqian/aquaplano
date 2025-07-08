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
    float strength = 0.05;

    vec3 flowField = vec3(
        simplexNoise4d(vec4(particle.xyz , uTime)),
        simplexNoise4d(vec4(particle.yxz + 1.0, uTime)),
        simplexNoise4d(vec4(particle.zxy + 2.0, uTime))
    );
    flowField = normalize(flowField);

    if(disturbIntensity > 0.0){
        particle.xyz += flowField * disturbIntensity * strength * particle.a;
        particle.a += uDeltaTime;
    } else {
        particle.a += uDeltaTime;
        particle.xyz += flowField * uDeltaTime;
    }
}
    gl_FragColor.rgba = particle;
}