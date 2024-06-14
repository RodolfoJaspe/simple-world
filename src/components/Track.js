import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

import React from 'react';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Track () {
    const gltf = useLoader(GLTFLoader, '/Assets/track/scene.gltf');

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const lamps = [[262,16,-7],[262,16,7],[197,6,6.5],[197,6,-8],[92.2,6.5,-32.2],[83.5,7,-21],[94,6,-8],[94,6,8],[-56.8,9,7],[-56.8,9,-7],[-107.4,12,26.2],[-116.5,11,16]]

    return (
        <RigidBody type="fixed" colliders='trimesh' position={[0, 0, 0]}>
            <primitive object={gltf.scene} scale={1} receiveShadow />
            {lamps.map(lamp => (<pointLight position={lamp} intensity={100}/>))}
        </RigidBody>
    );
};