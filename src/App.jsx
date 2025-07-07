import './App.css'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { FlowFieldParticles } from './FlowFieldParticles'
import { useMemo, useState, useRef, useEffect } from 'react'
import * as dat from 'dat.gui'

function App() {
  const [points, setPoints] = useState({
    p1: { x: -2, y: 0.3, z: 2 },
    p2: { x: 0, y: 0.4, z: 2 },
    p3: { x: 2, y: 0.15, z: -2 },
  })
  const [colors, setColors] = useState({
    color1: '#00b4d8', // aqua
    color2: '#0077b6', // marine
  })
  const gui = useRef(null)

  useEffect(() => {
    if (gui.current) return
    gui.current = new dat.GUI()

    const folder1 = gui.current.addFolder('Point 1')
    folder1.add(points.p1, 'x', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p1: { ...p.p1, x: v } })))
    folder1.add(points.p1, 'z', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p1: { ...p.p1, z: v } })))

    const folder2 = gui.current.addFolder('Point 2')
    folder2.add(points.p2, 'x', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p2: { ...p.p2, x: v } })))
    folder2.add(points.p2, 'z', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p2: { ...p.p2, z: v } })))

    const folder3 = gui.current.addFolder('Point 3')
    folder3.add(points.p3, 'x', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p3: { ...p.p3, x: v } })))
    folder3.add(points.p3, 'z', -10, 10, 0.1).onChange(v => setPoints(p => ({ ...p, p3: { ...p.p3, z: v } })))
    const colorFolder = gui.current.addFolder('Colors')
    colorFolder.addColor(colors, 'color1').onChange(v => setColors(c => ({ ...c, color1: v })))
    colorFolder.addColor(colors, 'color2').onChange(v => setColors(c => ({ ...c, color2: v })))
  }, [points, colors])

  const tube = useMemo(() => {
    const controlPoints = [
      new THREE.Vector3(-6, 5, 3),                      // fixed start
      new THREE.Vector3(points.p1.x, points.p1.y, points.p1.z),
      new THREE.Vector3(points.p2.x, points.p2.y, points.p2.z),
      new THREE.Vector3(points.p3.x, points.p3.y, points.p3.z),
      new THREE.Vector3(10, 0.1, -6.5),                       // fixed end
    ]

    const curve = new THREE.CatmullRomCurve3(controlPoints)
    const geometry = new THREE.TubeGeometry(curve, 300, 0.3, 16, false)
    geometry.computeVertexNormals()
    return geometry
  }, [points])

  return (
    <Canvas
      style={{ height: '100vh', background: 'white' }}
      camera={{ position: [0, 10, 0], up: [0, 0, -1], near: 0.1, far: 100 }}>
      <ambientLight />

      <pointLight position={[10, 10, 10]} />

      <FlowFieldParticles shape="disc" size={1.5} colors={[colors.color1, colors.color2]}>
        <mesh geometry={tube}>
          <meshStandardMaterial color='blue' />
        </mesh>
      </FlowFieldParticles>

    </Canvas>
  )
}

export default App