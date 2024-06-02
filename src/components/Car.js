import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React, { forwardRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Car = forwardRef(({ camera }, ref) => {
    const gltf = useLoader(GLTFLoader, '/Assets/car/scene.gltf');

    // Enable shadows on the car mesh
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const rightFrontRim = gltf.scene.getObjectByName('right_front_rim');
    const leftFrontRim = gltf.scene.getObjectByName('left_front_rim');
    const rearRims = gltf.scene.getObjectByName('rear_rims');
    const rightFrontTire = gltf.scene.getObjectByName('right_front_tire');
    const leftFrontTire = gltf.scene.getObjectByName('left_front_tire');
    const rearTires = gltf.scene.getObjectByName('rear_tires');

    const wheels = {
        rightFrontRim:rightFrontRim,
        leftFrontRim:leftFrontRim,
        rearRims:rearRims,
        rightFrontTire:rightFrontTire,
        leftFrontTire:leftFrontTire,
        rearTires:rearTires
    }

    // console.log(wheels)

    return (
        <RigidBody 
            type="dynamic" 
            position={[0, 5, 0]} 
            rotation={[0, Math.PI / 2, 0]} 
            colliders="hull" 
            mass={10000}
            linearDamping={1} 
            angularDamping={5} 
            gravityScale={2}
            ref={ref}
            userData={wheels}
        >
            <primitive object={gltf.scene} scale={1} castShadow receiveShadow />
        </RigidBody>
    );
});

export default Car;
