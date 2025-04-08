import { useLoader } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import VideoTexture from './VideoTexture';

const Riptide = () => {
    const gltf = useLoader(GLTFLoader, '/Assets/riptide/scene.gltf');
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    }, []);

    return (
        <mesh position={[1300, 1000, -500]} rotation={[0, -Math.PI, 0]}>
            <primitive object={gltf.scene} scale={600} receiveShadow />
            <VideoTexture 
                videoUrl="VMuKbcYnulM" 
                position={[147, 370, -571]} 
                rotation={[0, Math.PI / 2, 0]} 
                scale={[49, 49, 49]} 
            />
        </mesh>
    );
};

export default Riptide;
