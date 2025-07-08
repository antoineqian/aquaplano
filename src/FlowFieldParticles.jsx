import React, { useCallback, useEffect, useRef, useMemo, memo, useState, forwardRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, BufferAttribute, Color, Uniform, Vector3, MathUtils } from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { Html } from '@react-three/drei'
import ParticlesFragmentShader from './shaders/particle_fragment.glsl'
import GpgpuFragmentShader from './shaders/gpgpu_vertex.glsl'
import ParticlesVertexShader from './shaders/particle_vertex.glsl'

const ParticlesMaterial = memo(
  forwardRef((props, ref) => {
    const uniforms = useMemo(() => {
      return {
        uTime: new Uniform(0),
        uSize: new Uniform(0.4),
        uColors: new Uniform([]),
        uHasColors: new Uniform(false),
        uShape: new Uniform(1),
        uMeshMap: new Uniform(null),
        uParticlesTexture: new Uniform(null),
        uResolution: new Uniform([0, 0]),
        uHasLightSource: new Uniform(false),
        uLightSource: new Uniform(new Vector3()),
        uLightSourceColor: new Uniform(new Vector3()),
        uLightSourceIntensity: new Uniform(1.0),
      };
    }, []);
    return <shaderMaterial ref={ref} uniforms={uniforms} vertexShader={ParticlesVertexShader} fragmentShader={ParticlesFragmentShader} />;
  })
);
const ParticleShapeIntValue = shapeString => {
  switch (shapeString) {
    case "disc":
      return 1;
    case "ring":
      return 2;
    case "sphere":
      return 3;
    case "square":
      return 4;
    default:
      return 1;
  }
};
const InitMeshWrapper = forwardRef(({ children, visible, onUpdate, onPointerMove, onPointerOver, onPointerOut, onClick }, ref) => {
  const handleUpdate = e => onUpdate(e);
  const handlePointerMove = e => onPointerMove(e);
  const handlePointerOver = e => onPointerOver(e)
  const handlePointerOut = e => onPointerOut(e)
  const handleClick = e => onClick(e)

  const clonedChildren = React.Children.map(children, child => {
    const { position = [0, 0, 0] } = child.props;
    return React.cloneElement(child, {
      ref,
      scale: 0.98,
      position,
      visible,
      onUpdate: handleUpdate,
      onPointerMove: handlePointerMove,
      onPointerOver: handlePointerOver,
      onPointerOut: handlePointerOut,
      onClick: handleClick
    });
  });

  return <>{clonedChildren}</>;
});

const DebugMessage = (mssg, color = "red") => {
  console.log(`%c ${mssg}`, `color: white; background-color: ${color}; font-size: 12px; padding: 4px; border-radius: 4px;`);
};

const FlowFieldParticles = ({
  debug = false,
  name = null,
  interactive = true,
  childMeshVisible = false,
  colors = null,
  size = 0.1,
  disturbIntensity = 0.3,
  repulsionForce = 1.0,
  shape = "disc",
  lightSource = null,
  curve = null,
  children,
}) => {
  const [initMeshRef, setInitMeshRef] = useState(null);
  const ref = useRef(null);
  const meshRef = useRef(null);
  const particlesRef = useRef(null);
  const particlesMaterialRef = useRef(null);
  const helperRef = useRef(null);
  const mouseRef = useRef(new Vector3());
  const meshWorldPosition = useMemo(() => new Vector3(), []);
  const previousTime = useRef(0);
  const gl = useThree(state => state.gl);

  const modelMesh = useMemo(() => {
    if (!meshRef.current) return;
    return meshRef.current;
  }, [initMeshRef]);
  const modelGeometry = useMemo(() => {
    if (!modelMesh) return;
    if (debug) {
      DebugMessage(`${name} - modelGeometry()`, "green");
    }
    const { geometry, material } = modelMesh;
    const { attributes } = geometry;
    const { count } = attributes.position;
    return { geometry, material, attributes, count };
  }, [modelMesh]);

  const gpgpu = useMemo(() => {
    if (!modelGeometry) return;
    if (debug) {
      DebugMessage(`${name} - gpgpu()`, "green");
    }

    const size = Math.ceil(Math.sqrt(modelGeometry.count));
    const GCR = new GPUComputationRenderer(size, size, gl);
    const dataTexture = GCR.createTexture(); // RGBA DATA Texture

    for (let i = 0; i < modelGeometry.count; i++) {
      dataTexture.image.data[i * 4 + 0] = modelGeometry.attributes.position.array[i * 3 + 0];
      dataTexture.image.data[i * 4 + 1] = modelGeometry.attributes.position.array[i * 3 + 1];
      dataTexture.image.data[i * 4 + 2] = modelGeometry.attributes.position.array[i * 3 + 2];
      dataTexture.image.data[i * 4 + 3] = Math.random();
    }
    const tangentTexture = GCR.createTexture();
    for (let i = 0; i < modelGeometry.count; i++) {
      // Get relative t value along the curve (0 to 1)
      const t = i / (modelGeometry.count - 1);

      // Get tangent direction from the curve
      const tangent = curve.getTangent(t).normalize();

      tangentTexture.image.data[i * 4 + 0] = tangent.x;
      tangentTexture.image.data[i * 4 + 1] = tangent.y;
      tangentTexture.image.data[i * 4 + 2] = tangent.z;
    }

    const particlesVariable = GCR.addVariable("uParticles", GpgpuFragmentShader, dataTexture);
    GCR.setVariableDependencies(particlesVariable, [particlesVariable]);

    GCR.init();
    const renderTarget = GCR.getCurrentRenderTarget(particlesVariable);
    const renderTargetTexture = renderTarget.texture;

    // Uniforms
    particlesVariable.material.uniforms.uTime = new Uniform(0);
    particlesVariable.material.uniforms.uDeltaTime = new Uniform(0);
    particlesVariable.material.uniforms.uBaseParticlesTexture = new Uniform(dataTexture);
    particlesVariable.material.uniforms.uDisturbIntensity = new Uniform(disturbIntensity);
    particlesVariable.material.uniforms.uRepulsionForce = new Uniform(repulsionForce);
    particlesVariable.material.uniforms.uMouse = new Uniform(new Vector3(0, 0, 0));
    particlesVariable.material.uniforms.uMouseDelta = new Uniform(0);
    particlesVariable.material.uniforms.uInteractive = new Uniform(interactive);
    particlesVariable.material.uniforms.uTangentTexture = new Uniform(tangentTexture);

    return { ref: GCR, texture: renderTargetTexture, particlesVariable, size };
  }, [modelGeometry]);

  const particles = useMemo(() => {
    if (!modelGeometry) return;
    if (debug) {
      DebugMessage(`${name} - particles()`, "green");
    }
    const particlesUvArray = new Float32Array(modelGeometry.count * 2);
    const particlesSizeArray = new Float32Array(modelGeometry.count);
    for (let y = 0; y < gpgpu.size; y++) {
      for (let x = 0; x < gpgpu.size; x++) {
        const i = y * gpgpu.size + x;
        const i2 = i * 2;
        const uvX = (x + 0.5) / gpgpu.size;
        const uvY = (y + 0.5) / gpgpu.size;
        // Set UV Position
        particlesUvArray[i2 + 0] = uvX;
        particlesUvArray[i2 + 1] = uvY;
        // Random size
        particlesSizeArray[i] = Math.random();
      }
    }
    const geometry = new BufferGeometry();
    geometry.setDrawRange(0, modelGeometry.count);
    geometry.setAttribute("aParticlesUv", new BufferAttribute(particlesUvArray, 2));
    geometry.setAttribute("aParticlesSize", new BufferAttribute(particlesSizeArray, 1));
    modelGeometry.attributes.color &&
      geometry.setAttribute("aParticlesColor", new BufferAttribute(modelGeometry.attributes.color.array, 3));
    modelGeometry.attributes.position && geometry.setAttribute("position", new BufferAttribute(modelGeometry.attributes.position.array, 3));
    modelGeometry.attributes.uv && geometry.setAttribute("aMeshUv", new BufferAttribute(modelGeometry.attributes.uv.array, 2));
    return { geometry, material: null, uvAttribute: particlesUvArray };
  }, [modelGeometry]);
  const handlePointerMove = useCallback(e => {
    const { point, object } = e;
    object.getWorldPosition(meshWorldPosition);
    if (mouseRef.current) {
      const { x, y, z } = point.sub(meshWorldPosition);
      mouseRef.current.set(x, y, z);
    }
  }, []);
  const handlePointerOver = useCallback(e => {
    document.body.style.cursor = 'pointer'
    e.stopPropagation();
  }, []);
  const handlePointerOut = useCallback(e => {
    document.body.style.cursor = 'default'
    e.stopPropagation()
  }, []);
  const handleClick = useCallback(e => {
    e.stopPropagation()
    setShowLabel(true)
  }, []);

  useEffect(() => {
    if (debug) {
      DebugMessage(`${name} - useEffect()`, "purple");
    }
    if (gpgpu) {
      gpgpu.particlesVariable.material.uniforms.uInteractive.value = interactive;
    }
    if (particlesRef.current) {
      particlesRef.current.geometry.setAttribute("aNormal", modelGeometry.attributes.normal);
    }
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.transparent = true;
      particlesMaterialRef.current.uniforms.uHasColors.value = true;
      const colorsArray = colors?.map(color => {
        if (typeof color === "string") {
          return new Color(color);
        } else {
          if (typeof color === "object" && "isColor" in color) {
            return color;
          }
        }
      }) || [modelGeometry.material.color, modelGeometry.material.color];
      particlesMaterialRef.current.uniforms.uColors.value = colorsArray;
      particlesMaterialRef.current.uniforms.uSize.value = size;

      if (lightSource) {
        let light;
        if ("current" in lightSource) {
          light = lightSource.current;
        } else if ("position" in lightSource) {
          light = lightSource;
        }

        if ("position" in light) {
          particlesMaterialRef.current.uniforms.uHasLightSource.value = true;
          particlesMaterialRef.current.uniforms.uLightSource.value.copy(light.position);
        }
        if ("color" in light) {
          particlesMaterialRef.current.uniforms.uLightSourceColor = new Uniform(light.color);
        }
        if ("intensity" in light) {
          particlesMaterialRef.current.uniforms.uLightSourceIntensity = new Uniform(light.intensity);
        }
      } else {
        particlesMaterialRef.current.uniforms.uHasLightSource.value = false;
      }
      particlesMaterialRef.current.uniforms.uShape.value = ParticleShapeIntValue(shape);

      if (modelMesh?.material?.map) {
        particlesMaterialRef.current.uniforms.uHasColors.value = false;
        particlesMaterialRef.current.uniforms.uMeshMap.value = modelMesh.material.map;
      }
    }
  }, [colors, size, shape, lightSource, interactive, particles]);
  let lastMousePosX = 0;
  let mouseDeltaValue = 0;

  useFrame(({ clock, camera }) => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = Math.min(elapsedTime - previousTime.current, 1 / 60);
    previousTime.current = elapsedTime;
    mouseDeltaValue = MathUtils.lerp(mouseDeltaValue, Math.abs(lastMousePosX - mouseRef.current.x), 0.1);
    if (particlesRef.current) {
      particlesRef.current.position.copy(modelMesh.position);
      //modelMesh.position.copy(modelMesh.position);
    }
    if (particlesMaterialRef.current) {
      /** Gpgpu computation */
      gpgpu.ref.compute();
      gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
      gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
      gpgpu.particlesVariable.material.uniforms.uDisturbIntensity.value = disturbIntensity;
      gpgpu.particlesVariable.material.uniforms.uRepulsionForce.value = repulsionForce;
      gpgpu.particlesVariable.material.uniforms.uMouse.value.copy(mouseRef.current);
      gpgpu.particlesVariable.material.uniforms.uMouseDelta.value = mouseDeltaValue;

      /** Particles Material uniforms */
      particlesMaterialRef.current.uniforms.uTime.value = elapsedTime;
      particlesMaterialRef.current.uniforms.uResolution.value = [gpgpu.size, gpgpu.size];
      particlesMaterialRef.current.uniforms.uParticlesTexture.value = gpgpu.ref.getCurrentRenderTarget(gpgpu.particlesVariable).texture;
      lightSource && particlesMaterialRef.current.uniforms.uLightSource.value.copy(lightSource.current.position);

      /** Helper */
      helperRef.current?.position.copy(mouseRef.current).add(modelMesh.position);
    }
    /** Mouse */
    lastMousePosX = MathUtils.lerp(lastMousePosX, mouseRef.current.x, 0.5);
  });
  if (debug) {
    DebugMessage(`${name} - <FlowFieldParticles />`, "blue");
  }
  const [showLabel, setShowLabel] = useState(false)
  const pendingInitMeshRef = useRef(null);

  useEffect(() => {
    if (pendingInitMeshRef.current && !initMeshRef) {
      setInitMeshRef(pendingInitMeshRef.current);
    }
  }, [initMeshRef]);
  const labelRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labelRef.current && !labelRef.current.contains(event.target)) {
        setShowLabel(false);
      }
    };

    if (showLabel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLabel]);
  return (
    <group ref={ref}>
      {particles && (
        <points visible={true} ref={particlesRef} geometry={particles?.geometry} position={modelMesh?.position}>
          <ParticlesMaterial ref={particlesMaterialRef} attach='material' />
        </points>
      )}
      <InitMeshWrapper
        ref={meshRef}
        visible={childMeshVisible}
        onUpdate={e => {
          if (e) pendingInitMeshRef.current = e;
        }}
        onPointerMove={handlePointerMove}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {children}
      </InitMeshWrapper>

      {debug && (
        <mesh ref={helperRef} position={[0, 0, 0]} scale={0.5}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshBasicMaterial color='red' />
        </mesh>
      )}
      {showLabel && (
        <Html position={[0, 2, 0]} center>
          <div ref={labelRef} style={{ background: 'white', padding: '0.5em 1em', borderRadius: '0.5em' }}>
            This is a river!
          </div>
        </Html>
      )}
    </group>
  );
};

export { FlowFieldParticles };