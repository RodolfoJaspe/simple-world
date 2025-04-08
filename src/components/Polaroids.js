import { useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Polaroids = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/polaroids/scene.gltf');

    return (
        <mesh position={[1380,600,-100]} rotation={[0,-Math.PI / 2,0]}>
            <primitive object={gltf.scene} scale={300} receiveShadow />
        </mesh>
    );
};

export default Polaroids;
