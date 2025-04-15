import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import React, { useRef } from 'react';

export default function AICar() {
    const { scene } = useGLTF('/Assets/mustang/scene.gltf');
    const rigidBodyRef = useRef();

    useFrame(() => {
        // if (rigidBodyRef.current) {
        //     // Set constant velocity instead of applying impulse
        //     rigidBodyRef.current.setLinvel(
        //         { x: 0, y: 0, z: 0 },
        //         true
        //     );
        // }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            colliders="cuboid"
            type="dynamic"
            position={[-150, 685, -200]}
            rotation={[0, Math.PI / 2, 0]}
            restitution={0.2}
            friction={0.7}
            linearDamping={1}
            angularDamping={1}
            gravityScale={2}
            mass={1000}
        >
            <primitive 
                object={scene} 
                scale={0.16}
                position={[0, -0.8, 0]}
            />
        </RigidBody>
    );
} 