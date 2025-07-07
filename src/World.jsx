import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { FlowFieldParticles } from './FlowFieldParticles'
import { EffectComposer, Vignette, SMAA, Bloom, HueSaturation } from '@react-three/postprocessing'

const World = ({ points, colors }) => {
  const lightRef = useRef()
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color('#123456')
  }, [scene])

  const tube = useMemo(() => {
    const controlPoints = [
      new THREE.Vector3(-6, 5, 3),
      new THREE.Vector3(points.p1.x, points.p1.y, points.p1.z),
      new THREE.Vector3(points.p2.x, points.p2.y, points.p2.z),
      new THREE.Vector3(points.p3.x, points.p3.y, points.p3.z),
      new THREE.Vector3(10, 0.1, -6.5),
    ]

    const curve = new THREE.CatmullRomCurve3(controlPoints)
    const geometry = new THREE.TubeGeometry(curve, 300, 0.3, 16, false)
    geometry.computeVertexNormals()
    return geometry
  }, [points])

  return (
    <>
      <ambientLight />
      <spotLight
        ref={lightRef}
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color={'#ffffff'}
        castShadow
      />
      <pointLight position={[10, 10, 10]} />
      <FlowFieldParticles
        shape="disc"
        size={1.5}
        colors={[colors.color1, colors.color2]}
        lightSource={lightRef}
      >
        <mesh geometry={tube}>
          <meshStandardMaterial color="blue" />
        </mesh>
      </FlowFieldParticles>
      <EffectComposer>
        <Vignette offset={0.1} darkness={0.5} />
        <HueSaturation saturation={0.12} />
        <Bloom intensity={5} />
      </EffectComposer>
    </>
  )
}

export default World