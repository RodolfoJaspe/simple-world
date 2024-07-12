import { useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Guitar = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/guitar/scene.gltf');

    return (
        <mesh position={[700,-70,-1200]} rotation={[0,-Math.PI / 5,0]}>
            <primitive object={gltf.scene} scale={5} receiveShadow />
        </mesh>
    );
};

export default Guitar;
