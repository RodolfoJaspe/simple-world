import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useCameraState } from '../state/CameraStateContext';
import IframeTexture from './IframeTexture';

const PictureFrame = ({ project, carPosition, setCarPosition, camera }) => {
    const gltf = useLoader(GLTFLoader, project.modelLocation);
    const { raycaster, mouse, scene } = useThree();
    const { cameraState, setCameraState } = useCameraState();
    const [targetPosition, setTargetPosition] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [iframeVisible, setIframeVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const pictureFrameRef = useRef();

    useEffect(() => {
        if (gltf && gltf.scene) {
            const mesh = gltf.scene;
            pictureFrameRef.current = mesh;
            mesh.traverse((child) => {
                if (child.isMesh && child.name === 'red_button') {
                    child.userData = { onClick: handleClick };
                    child.onPointerOver = handlePointerOver;
                    child.onPointerOut = handlePointerOut;
                }
            });
        }
    }, [gltf]);

    const handleClick = () => {
        setCameraState(prevState => {
            return { ...prevState, followingCar: !prevState.followingCar };
        });
        const pictureFramePosition = new Vector3();
        pictureFrameRef.current.getWorldPosition(pictureFramePosition);
        setTargetPosition(new Vector3(pictureFramePosition.x, pictureFramePosition.y, pictureFramePosition.z - 500));
        setIsAnimating(true);
    };

    const handlePointerOver = () => {
        setIsHovering(true);
    };

    const handlePointerOut = () => {
        setIsHovering(false);
    };

    useFrame(() => {
        if (isAnimating && targetPosition) {
            const step = 0.03; // Adjust step for smoother animation
            camera.position.lerp(targetPosition, step);
            camera.lookAt(pictureFrameRef.current.position);

            // Toggle iframe visibility based on the current state
            if (!cameraState.followingCar) {
                setIframeVisible(true);
            } else {
                setIframeVisible(false);
            }

            if (camera.position.distanceTo(targetPosition) < 0.1) {
                camera.position.copy(targetPosition);
                setIsAnimating(false);
            }
            setCarPosition(pictureFrameRef.current.position);
        }
    });

    const handlePointerDown = (event) => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.name === 'red_button' && intersectedObject.userData.onClick) {
                intersectedObject.userData.onClick();
            }
        }
    };

    useEffect(() => {
        window.addEventListener('pointerdown', handlePointerDown);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [raycaster, mouse, camera, scene.children]);

    useEffect(() => {
        if (isHovering) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    }, [isHovering]);

    return (
        <>
            <primitive
                object={gltf.scene}
                position={project.position}
                rotation={project.rotation}
                scale={project.scale}
                receiveShadow
                onPointerOver={(event) => {
                    if (event.object.name === 'red_button') {
                        handlePointerOver();
                    }
                }}
                onPointerOut={(event) => {
                    if (event.object.name === 'red_button') {
                        handlePointerOut();
                    }
                }}
            />
            {iframeVisible && (
                <IframeTexture project={project} />
            )}
        </>
    );
};

export default PictureFrame;
