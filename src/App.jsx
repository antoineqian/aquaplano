import './App.css'
import { Canvas } from '@react-three/fiber'
import World from './World'
import IconPanel from './IconPanel'

function App() {

  return <>
    {/* <div className="banner">L'eau</div> */}
    <Canvas
      style={{ height: '100vh' }}
      camera={{ position: [0, 10, 0], up: [0, 0, -1], near: 0.1, far: 100 }}
    >

      <World points={{
        p1: { x: -2, y: 0.3, z: 2 },
        p2: { x: 0, y: 0.4, z: 2 },
        p3: { x: 2, y: 0.15, z: -2 },
      }} colors={{
        color1: '#00b4d8',
        color2: '#0077b6',
      }} postProcessing={{
        saturation: 0.33,
        bloomIntensity: 1
      }} />
    </Canvas>

    <IconPanel />
  </>
}

export default App