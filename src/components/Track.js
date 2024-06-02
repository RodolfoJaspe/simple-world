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

    return (
        <RigidBody type="fixed" colliders='trimesh' position={[0, 0, 0]}>
            <primitive object={gltf.scene} scale={1} receiveShadow />
        </RigidBody>
    );
};