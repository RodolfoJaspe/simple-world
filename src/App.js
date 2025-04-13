import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import React, { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import "./App.css";
import keysIcon from './assets/controls/arrowkeys.png';
import mouseIcon from './assets/controls/mouse.png';
import AnimatedPlane from './components/AnimatedPlane';
import Ball from './components/Ball';
import DesktopCarControls from './components/DesktopCarControls';
import Guitar from './components/Guitar';
import MobileCarControls from './components/MobileCarControls';
import PictureFrame from './components/PictureFrame';
import ProjectsBlocks from './components/ProjectsBlocks';
import Riptide from './components/Riptide';
import Roof from './components/Roof';
import Room from './components/Room';
import Track from './components/Track';
import { projects } from './data/pictureFramesData';
import { useCameraState } from './state/CameraStateContext';



function Scene() {
    const [orbitEnabled, setOrbitEnabled] = useState(true);
    const [carPosition, setCarPosition] = useState([0, 0, 0]);
    const { cameraState } = useCameraState();

    const ramp = useLoader(GLTFLoader, '/Assets/ramp/scene.gltf');
    const ramp2 = useLoader(GLTFLoader, '/Assets/ramp2/scene.gltf');

    const [isMoving, setIsMoving] = useState(false);
    const { camera } = useThree();
    const [initialCameraPos, setinItialCameraPos] = useState([10,1500,0]);

    useFrame(() => {
        if(isMoving){
            camera.position.copy(cameraState.position);
            camera.lookAt(cameraState.direction); 
        }
    })

    useEffect(()=>{
        setinItialCameraPos([-2, 682.5, -206]) // camera starts close to car looking up at walls 
    },[])

    return (
        <>
            <PerspectiveCamera
                makeDefault
                position={initialCameraPos}
                fov={75}
                near={0.1}
                far={10000}
                direction={[0,1000,0]}
            />
            <Physics 
            gravity={[0, -20, 0]} 
            tolerance={0.01}
            integrationParameters={{ dt: 1 / 60, maxVelocityIterations: 8, maxVelocityFrictionIterations: 4 }}>
                <ambientLight intensity={2} />
                <directionalLight
                    position={[200, 500, 50]}
                    intensity={1}
                    castShadow
                    penumbra={1}
                    color={"white"}
                />
                <directionalLight
                    position={[-800, 300, -100]}
                    intensity={2}
                    castShadow
                    penumbra={1}
                    color={"blue"}
                />
                <directionalLight
                    position={[800, 300, 100]}
                    intensity={2}
                    castShadow
                    penumbra={1}
                    color={"red"}
                />
                {window.innerWidth > 1000 ? 
                <DesktopCarControls setOrbitEnabled={setOrbitEnabled} carPosition={carPosition} setCarPosition={setCarPosition} camera={camera} isMoving={isMoving} setIsMoving={setIsMoving}/> : 
                <MobileCarControls setOrbitEnabled={setOrbitEnabled} setCarPosition={setCarPosition} camera={camera}/>
                }
                <RigidBody colliders='trimesh' type='fixed'>
                    <primitive object={ramp.scene} scale={4} position={[-90, 678, -200]} rotation={[0, Math.PI / 2, 0]} />
                </RigidBody>
                <RigidBody colliders='trimesh' type='fixed'>
                    <primitive object={ramp2.scene} scale={150} position={[-920, 690, 0]} rotation={[0, Math.PI / 2, 0]} />
                </RigidBody>
                <Track />
                {projects.map((project,i) => <PictureFrame project={project} carPosition={carPosition} setCarPosition={setCarPosition} camera={camera} key={i}/>)}
                <ProjectsBlocks />
                {orbitEnabled && <OrbitControls target={carPosition} maxDistance={500} minDistance={5}/>}
                <AnimatedPlane />
                <Room />
                <Guitar />
                <Roof />
                <Ball />
                <Riptide />
            </Physics>
        </>
    );
}

function App() {
    return (
        <div className='App'>
            <Canvas shadows>
                <Scene />
            </Canvas>
            <div id="joystick-container" style={{ position: 'absolute', left: '50%', bottom: '50px', transform: 'translateX(-50%)' }}></div>
            <div style={{position: 'absolute', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', width: '200px', alignItems: 'center', textAlign: 'center', opacity: .6, color: 'white', fontFamily: ''}}>
                <img src={mouseIcon} style={{width: '50px'}}/>
                <h3>Look / Interact</h3>
                <img src={keysIcon} style={{width: '100px'}}/>
                <h3>Drive</h3>
            </div>
        </div>
    );
}

export default App;
