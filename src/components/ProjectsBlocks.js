import { useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ProjectsBlocks = () => {

        const gltf = useLoader(GLTFLoader, '/Assets/projects_blocks/scene.gltf');

    return (
        <mesh position={[-150,1600,1160]} rotation={[0,Math.PI / 2,0]}>
            <primitive object={gltf.scene} scale={500} receiveShadow />
        </mesh>
    );
};

export default React.memo(ProjectsBlocks);
