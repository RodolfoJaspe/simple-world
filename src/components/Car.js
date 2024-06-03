import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React, { forwardRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const Car = forwardRef(({ camera, wheelsRef }, ref) => {
    const gltf = useLoader(GLTFLoader, '/Assets/car/scene.gltf');
    // Enable shadows on the car mesh
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Extract wheels for rotation
    const wheels = {
        leftFrontRim: gltf.scene.getObjectByName('left_front_rim'),
        leftFrontTire: gltf.scene.getObjectByName('left_front_tire'),
        rightFrontRim: gltf.scene.getObjectByName('right_front_rim'),
        rightFrontTire: gltf.scene.getObjectByName('right_front_tire'),
        rearRims: gltf.scene.getObjectByName('rear_rims'),
        rearTires: gltf.scene.getObjectByName('rear_tires'),
    };

    // Store wheels in wheelsRef
    if (wheelsRef && wheelsRef.current) {
        wheelsRef.current = wheels;
    }

    return (
        <RigidBody 
            type="dynamic" 
            position={[0, 4, -1]} 
            rotation={[0, 1, 0]} 
            colliders="hull" 
            mass={1000}
            linearDamping={1} 
            angularDamping={1} 
            gravityScale={2}
            ref={ref}
        >
            <primitive object={gltf.scene} scale={1} castShadow receiveShadow />
        </RigidBody>
    );
});

export default Car
