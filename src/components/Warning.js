import { useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Warning = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/warning/scene.gltf');

    return (
        <mesh position={[-1640,-70,-480]} rotation={[0,0,0]}>
            <primitive object={gltf.scene} scale={6} receiveShadow />
        </mesh>
    );
};

export default Warning;
