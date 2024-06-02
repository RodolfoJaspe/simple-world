import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React, { useState } from 'react';
import "./App.css";
import CarControls from './components/CarControls';
import Track from './components/Track';

function App() {
    const [orbitEnabled, setOrbitEnabled] = useState(true);
    const [carPosition, setCarPosition] = useState([0,0,0])

    return (
        <div className='App'>
            <Canvas shadows >
                <Physics gravity={[0, -9.81, 0]} integrationParameters={{ maxVelocityIterations: 16, maxVelocityFrictionIterations: 8 }}>
                    <ambientLight intensity={1} />
                    <directionalLight 
                        position={[800, 300, 100]} 
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
                    {orbitEnabled && <OrbitControls target={carPosition}/>}
                </Physics>
            </Canvas>
            <div id="joystick-container" style={{ position: 'absolute', left: '50%', bottom: '50px', transform: 'translateX(-50%)' }}></div>
        </div>
    );
}

export default App;
