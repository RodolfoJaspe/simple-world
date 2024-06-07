import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ProjectBillboard = () => {
    const gltf = useLoader(GLTFLoader, '/Assets/billboards/billboard2/scene.gltf');
    const texture = useLoader(THREE.TextureLoader, '/Assets/billboards/billboard2/textures/dayana_morales.jpg');

    useEffect(() => {
        // Adjust texture properties
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.rotation = 0; // Rotate the texture if needed
        texture.repeat.set(1, 1); // Ensure the texture is applied once

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.name === 'billboard_surface') {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            }
        });
    }, [gltf, texture]);

    return (
        <RigidBody type="fixed" colliders="trimesh" position={[500, 55, 50]} rotation={[0, -Math.PI / 2.7, 0]}>
            <primitive object={gltf.scene} scale={3} receiveShadow />
        </RigidBody>
    );
};

export default ProjectBillboard;
