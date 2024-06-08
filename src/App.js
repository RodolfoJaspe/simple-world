import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React, { useState } from 'react';
import "./App.css";
import CarControls from './components/CarControls';
import ProjectBillboard from './components/ProjectBillboard';
import Track from './components/Track';

function App() {
    const [orbitEnabled, setOrbitEnabled] = useState(true);
    const [carPosition, setCarPosition] = useState([0,0,0])

    //test

    return (
        <div className='App'>
            <Canvas shadows >
                <PerspectiveCamera
                    makeDefault
                    position={[0, 1, 5]} // Initial camera position
                    fov={75} // Field of view
                    near={0.1} // Near clipping plane
                    far={3000} // Far clipping plane to render distant objects
                />
                <Physics gravity={[0, -20, 0]} integrationParameters={{ maxVelocityIterations: 16, maxVelocityFrictionIterations: 8 }}>
                    <ambientLight intensity={1} />
                    <directionalLight 
                        position={[400, 150, 50]} 
                        intensity={2} 
                        castShadow 
                        penumbra={1}
                        color={"red"}
                        shadow-mapSize-width={1000}
                        shadow-mapSize-height={1000}
                        shadow-normalBias={1}>
                        <orthographicCamera attach="shadow-camera" args={[-400, 500, 400, -100]}/>
                    </directionalLight>
                    <directionalLight 
                        position={[-800, 300, -100]} 
                        intensity={2} 
                        castShadow 
                        penumbra={1}
                        color={"blue"}
                        shadow-mapSize-width={1000}
                        shadow-mapSize-height={1000}
                        shadow-normalBias={1}>
                        <orthographicCamera attach="shadow-camera" args={[-400, 500, 400, -100]}/>
                    </directionalLight>
                    <CarControls setOrbitEnabled={setOrbitEnabled} setCarPosition={setCarPosition}/>
                    <Track />
                    <ProjectBillboard />
                    {orbitEnabled && <OrbitControls target={carPosition}/>}
                </Physics>
            </Canvas>
            <div id="joystick-container" style={{ position: 'absolute', left: '50%', bottom: '50px', transform: 'translateX(-50%)' }}></div>
        </div>
    );
}

export default App;
