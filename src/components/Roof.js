import { useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Roof = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/roof/scene.gltf');

    return (
        <mesh position={[-250,2000,-200]} rotation={[-.025,1.55,0]}>
            <primitive object={gltf.scene} scale={1000} receiveShadow />
        </mesh>
    );
};

export default Roof;
