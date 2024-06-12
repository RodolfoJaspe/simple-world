import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ProjectBillboard = ({modelLocation, position, rotation, scale} ) => {
    const gltf = useLoader(GLTFLoader, modelLocation);

    return (
        <RigidBody type="fixed" colliders="trimesh" position={position} rotation={rotation}>
            <primitive object={gltf.scene} scale={scale} receiveShadow />
        </RigidBody>
    );
};

export default ProjectBillboard;
