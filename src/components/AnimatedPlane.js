import { useFrame, useLoader } from '@react-three/fiber';
import React, { useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const AnimatedPlane = () => {
    const plane = useLoader(GLTFLoader, '/Assets/plane/scene.gltf');
    const [angle, setAngle] = useState(0);
    const radius = 1000;

    const initialPlanePosition = new THREE.Vector3(-120, 100, -radius);

    useFrame((state, delta) => {

        // Update the angle for circular motion
        setAngle((prevAngle) => prevAngle - delta * 0.2);

        // Calculate new positions
        const planeX = radius * Math.cos(angle + Math.PI / 15);  // Adjusted for offset
        const planeZ = radius * Math.sin(angle + Math.PI / 15);  // Adjusted for offset

        // Update the positions
        plane.scene.position.set(planeX, 800, planeZ);

        // Calculate forward vectors
        const planeForward = new THREE.Vector3(Math.cos(angle + Math.PI), 0, Math.sin(angle + Math.PI));

        // Update rotations to face the direction of movement
        plane.scene.lookAt(plane.scene.position.clone().add(planeForward));
        
        const prop = plane.scene.getObjectByName('prop')
        const propRotationSpeed =.5;
        prop.rotation.y -= propRotationSpeed
    });

    return (
        <>
            <primitive object={plane.scene} scale={50}/>
        </>
    );
};

export default React.memo(AnimatedPlane);
