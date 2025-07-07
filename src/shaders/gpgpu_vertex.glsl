#define PI 3.141592653589793
#define PI2 6.283185307179586
uniform float uTime;
uniform float uDeltaTime;
uniform vec3 uMouse;
uniform float uMouseDelta;
uniform float uDisturbIntensity;
uniform float uRepulsionForce;
uniform bool uInteractive;
uniform sampler2D uBaseParticlesTexture;
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);} float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;} float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;} vec4 grad4(float j, vec4 ip){ const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0); vec4 p,s; p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0; p.w = 1.5 - dot(abs(p.xyz), ones.xyz); s = vec4(lessThan(p, vec4(0.0))); p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; return p; } float snoise(vec4 v){ const vec2  C = vec2( 0.138196601125010504, 0.309016994374947451); vec4 i  = floor(v + dot(v, C.yyyy) ); vec4 x0 = v -   i + dot(i, C.xxxx); vec4 i0; vec3 isX = step( x0.yzw, x0.xxx ); vec3 isYZ = step( x0.zww, x0.yyz ); i0.x = isX.x + isX.y + isX.z; i0.yzw = 1.0 - isX; i0.y += isYZ.x + isYZ.y; i0.zw += 1.0 - isYZ.xy; i0.z += isYZ.z; i0.w += 1.0 - isYZ.z; vec4 i3 = clamp( i0, 0.0, 1.0 ); vec4 i2 = clamp( i0-1.0, 0.0, 1.0 ); vec4 i1 = clamp( i0-2.0, 0.0, 1.0 ); vec4 x1 = x0 - i1 + 1.0 * C.xxxx; vec4 x2 = x0 - i2 + 2.0 * C.xxxx; vec4 x3 = x0 - i3 + 3.0 * C.xxxx; vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx; i = mod(i, 289.0); float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x); vec4 j1 = permute( permute( permute( permute ( i.w + vec4(i1.w, i2.w, i3.w, 1.0 )) + i.z + vec4(i1.z, i2.z, i3.z, 1.0 )) + i.y + vec4(i1.y, i2.y, i3.y, 1.0 )) + i.x + vec4(i1.x, i2.x, i3.x, 1.0 )); vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ; vec4 p0 = grad4(j0,   ip); vec4 p1 = grad4(j1.x, ip); vec4 p2 = grad4(j1.y, ip); vec4 p3 = grad4(j1.z, ip); vec4 p4 = grad4(j1.w, ip); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; p4 *= taylorInvSqrt(dot(p4,p4)); vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0); m0 = m0 * m0; m1 = m1 * m1; return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ))) + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;}

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
        snoise(vec4(particle.xyz, uTime)),
        snoise(vec4(particle.yxz, uTime)),
        snoise(vec4(particle.zxy, uTime))
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