import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import "./App.css";
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
    const [isHovering, setIsHovering] = useState(false);
    const [originalEmissive, setOriginalEmissive] = useState(new THREE.Color(0x000000));
    const { cameraState } = useCameraState();
    // const boat = useLoader(GLTFLoader, '/Assets/boat/scene.gltf');
    // const billboard3 = useLoader(GLTFLoader, '/Assets/billboards/billboard3/scene.gltf');
    const ramp = useLoader(GLTFLoader, '/Assets/ramp/scene.gltf');
    const ramp2 = useLoader(GLTFLoader, '/Assets/ramp2/scene.gltf');

    // const hilitesRef = useRef();

    const [isMoving, setIsMoving] = useState(false);
    const { scene, camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const [initialCameraPos, setinItialCameraPos] = useState([10,1500,0]);

    useFrame(() => {
        if(isMoving){
            camera.position.copy(cameraState.position);
            camera.lookAt(cameraState.direction); 
        }
    })

    useEffect(()=>{
        setinItialCameraPos([0, 660, -320])
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
            <Physics gravity={[0, -20, 0]} integrationParameters={{ maxVelocityIterations: 16, maxVelocityFrictionIterations: 8 }}>
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
                    shadow-mapSize-width={1000}
                    shadow-mapSize-height={1000}
                    shadow-normalBias={1}
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
        </div>
    );
}

export default App;
