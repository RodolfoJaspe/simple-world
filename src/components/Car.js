import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React, { forwardRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const Car = forwardRef(({ camera, wheelsRef }, ref) => {
    const gltf = useLoader(GLTFLoader, '/Assets/camaro/scene.gltf');

    // Enable shadows on the car mesh
    gltf.scene.traverse((child) => {
        if (child.isMesh) { 
            child.castShadow = false;
            child.receiveShadow = false;
        }
    });

    // Extract wheels for rotation
    const wheels = {
        leftFrontWheel: gltf.scene.getObjectByName('left_front_wheel'),
        rightFrontWheel: gltf.scene.getObjectByName('right_front_wheel'),
        rearWheels: gltf.scene.getObjectByName('rear_wheels'),
    };

    // Store wheels in wheelsRef
    if (wheelsRef && wheelsRef.current) {
        wheelsRef.current = wheels;
    }

    return (
        <RigidBody 
            type="dynamic" 
            position={[0, 750, -200]} 
            rotation={[0, -Math.PI / 1.5, 0]} 
            colliders="cuboid" 
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

export default Car;
