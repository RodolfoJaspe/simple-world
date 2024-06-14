import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React, { useState } from 'react';
import "./App.css";
import DesktopCarControls from './components/DesktopCarControls';
import MobileCarControls from './components/MobileCarControls';
import ProjectBillboard from './components/ProjectBillboard';
import Track from './components/Track';

function App() {
    const [orbitEnabled, setOrbitEnabled] = useState(true);
    const [carPosition, setCarPosition] = useState([0, 0, 0]);

    return (
        <div className='App'>
            <Canvas shadows>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 1, 5]} // Initial camera position
                    fov={75} // Field of view
                    near={0.1} // Near clipping plane
                    far={3000} // Far clipping plane to render distant objects
                />
                <Physics gravity={[0, -20, 0]} integrationParameters={{ maxVelocityIterations: 16, maxVelocityFrictionIterations: 8 }}>
                    <ambientLight intensity={.5} />

                    {/* lights on zaniac billboard */}
                    <pointLight position={[248, 85, 570]} intensity={2000} color={'white'} />
                    <pointLight position={[200, 80, 500]} intensity={2000} color={'white'} />

                    {/* lights on rd billboard */}
                    <pointLight position={[0, 85, 460]} intensity={5000} />
                    <pointLight position={[50, 80, 530]} intensity={5000} />

                    {/* lights on dayana billboard */}
                    <pointLight position={[505, 25, 100]} intensity={1000} />
                    <pointLight position={[495, 25, 80]} intensity={1000} />
                    <pointLight position={[485, 25, 60]} intensity={1000} />
                    <pointLight position={[475, 25, 38]} intensity={1000} />
                    <pointLight position={[465, 25, 15]} intensity={1000} />

                    <directionalLight
                        position={[400, 150, 50]}
                        intensity={2}
                        castShadow
                        penumbra={1}
                        color={"red"}
                        shadow-mapSize-width={1000}
                        shadow-mapSize-height={1000}
                        shadow-normalBias={1}>
                        <orthographicCamera attach="shadow-camera" args={[-400, 500, 400, -100]} />
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
                        <orthographicCamera attach="shadow-camera" args={[-400, 500, 400, -100]} />
                    </directionalLight>
                    {window.innerWidth > 1000 ? <DesktopCarControls setOrbitEnabled={setOrbitEnabled} setCarPosition={setCarPosition} /> : <MobileCarControls setOrbitEnabled={setOrbitEnabled} setCarPosition={setCarPosition} />}
                    <Track />
                    <ProjectBillboard modelLocation={'/Assets/billboards/billboard2/scene.gltf'} position={[500, 55, 50]} rotation={[0, -Math.PI / 2.7, 0]} scale={3} castShadow />
                    <ProjectBillboard modelLocation={'/Assets/billboards/billboard4/scene.gltf'} position={[100, -30, 530]} rotation={[0, Math.PI * 1.03, 0]} scale={1.3} castShadow />
                    {orbitEnabled && <OrbitControls target={carPosition} />}
                </Physics>
            </Canvas>
            <div id="joystick-container" style={{ position: 'absolute', left: '50%', bottom: '50px', transform: 'translateX(-50%)' }}></div>
        </div>
    );
}

export default App;
