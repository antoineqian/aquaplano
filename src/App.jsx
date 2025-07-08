import './App.css'
import { Canvas } from '@react-three/fiber'
import { useState, useRef, useEffect } from 'react'
import * as dat from 'dat.gui'
import World from './World'
import { Perf } from 'r3f-perf'

function App() {
  const [points, setPoints] = useState({
    p1: { x: -2, y: 0.3, z: 2 },
    p2: { x: 0, y: 0.4, z: 2 },
    p3: { x: 2, y: 0.15, z: -2 },
  })
  const [colors, setColors] = useState({
    color1: '#00b4d8',
    color2: '#0077b6',
  })
  const [postProcessing, setPostProcessing] = useState({
    saturation: 0.12,
    bloomIntensity: 5,
  });
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

    const fxFolder = gui.current.addFolder('Post FX');

    fxFolder.add(postProcessing, 'saturation', -1, 1, 0.01).onChange(v =>
      setPostProcessing(p => ({ ...p, saturation: v }))
    );
    fxFolder.add(postProcessing, 'bloomIntensity', 0, 10, 0.1).onChange(v =>
      setPostProcessing(p => ({ ...p, bloomIntensity: v }))
    );
  }, [points, colors, postProcessing])

  return <>
    <Canvas
      style={{ height: '100vh' }}
      camera={{ position: [0, 10, 0], up: [0, 0, -1], near: 0.1, far: 100 }}
    >
      <Perf position="top-left" />

      <World points={points} colors={colors} postProcessing={postProcessing} />
    </Canvas>
  </>
}

export default App