import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const Ball = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/soccer_ball/scene.gltf');

    return (
        <RigidBody mass={.0001} position={[-200,710,-200]} rotation={[0,0,0]} gravityScale={.1}>
            <primitive object={gltf.scene} scale={5} receiveShadow />
        </RigidBody>
    );
};

export default Ball;
