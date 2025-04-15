import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCameraState } from '../state/CameraStateContext';
import { useResetState } from '../state/ResetStateContext';
import Car from './Car';
import CarSounds from './CarSounds';

//gpt
function vectorsAreClose(v1, v2, tolerance = 0.1) {
    const vec1 = new THREE.Vector3(...v1);
    const vec2 = new THREE.Vector3(...v2);
    return vec1.distanceTo(vec2) < tolerance;
}

const CarControls = ({ setOrbitEnabled, carPosition, setCarPosition, camera, isMoving, setIsMoving }) => {
    const carRef = useRef();
    const lastCarPosRef = useRef(new THREE.Vector3());
    const wheelsRef = useRef({});
    const { cameraState, setCameraState } = useCameraState();
    const { resetTrigger } = useResetState();
    const [invalidStateTime, setInvalidStateTime] = useState(0);
    const [acceleration, setAcceleration] = useState(0);
    const maxAcceleration = 200; // Max acceleration force
    const accelerationStep = 0.2; // Step to increase acceleration
    const initialPosition = useRef(new THREE.Vector3(0, 700, -200)); // car drop position after crash 
    const initialRotation = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))); // car drop rotation after crash

    // Interpolation factors
    const cameraLerpFactor = 0.1; // Camera smoothing factor
    const positionLerpFactor = 0.1; // For position interpolation

    // Physics update optimization
    const lastPhysicsUpdate = useRef(0);
    const physicsUpdateInterval = 1/60; // 60 FPS physics updates
    const lastCameraPos = useRef(new THREE.Vector3());
    const lastCameraTarget = useRef(new THREE.Vector3());
    const lastPos = useRef(new THREE.Vector3());
    const targetPos = useRef(new THREE.Vector3());
    const lerpFactor = 0.2; // Position interpolation factor

    const keys = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    }).current;

    // Calculate speed for sound effects
    const [speed, setSpeed] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (keys[event.key] !== undefined) {
                keys[event.key] = true;
            }
        };

        const handleKeyUp = (event) => {
            if (keys[event.key] !== undefined) {
                keys[event.key] = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keys]);

    const upVec = useRef(new THREE.Vector3(0, 1, 0));
    const forwardVec = useRef(new THREE.Vector3(0, 0, -1));

    useFrame((state, delta) => {
        if (carRef.current && cameraState.followingCar) {
            const rigidBody = carRef.current;
            const currentPos = new THREE.Vector3(
                rigidBody.translation().x,
                rigidBody.translation().y,
                rigidBody.translation().z
            );

            // Calculate vectors that are needed throughout the frame
            const up = upVec.current.clone().applyQuaternion(rigidBody.rotation());
            const forward = forwardVec.current.clone().applyQuaternion(rigidBody.rotation());

            // Update physics at fixed interval
            lastPhysicsUpdate.current += delta;
            if (lastPhysicsUpdate.current >= physicsUpdateInterval) {
                lastPhysicsUpdate.current = 0;

                const {
                    leftFrontWheel, 
                    rightFrontWheel, 
                    rearWheels, 
                } = wheelsRef.current;

                // Store target position
                targetPos.current.copy(currentPos);

                // Interpolate position
                lastPos.current.lerp(targetPos.current, lerpFactor);
                setCarPosition([lastPos.current.x, lastPos.current.y, lastPos.current.z]);

                const linvel = rigidBody.linvel();
                const angvel = rigidBody.angvel();

                if (keys.ArrowUp) {
                    setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration));
                } else if (keys.ArrowDown) {
                    setAcceleration((prev) => Math.max(prev - accelerationStep, -maxAcceleration));
                } else {
                    setAcceleration((prev) => {
                        const reduced = prev * 0.98;
                        return Math.abs(reduced) < 0.1 ? 0 : reduced;
                    });
                }

                linvel.x = forward.x * acceleration;
                linvel.z = forward.z * acceleration;

                const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

                if (speed > .5) {
                    const turnIntensity = 0.1 - speed / 2000;
                    if (keys.ArrowLeft && acceleration > 0) { 
                        angvel.y += turnIntensity;
                    }
                    if (keys.ArrowRight && acceleration > 0) {
                        angvel.y -= turnIntensity;
                    }
                    if (keys.ArrowLeft && acceleration < 0) {
                        angvel.y -= turnIntensity;
                    }
                    if (keys.ArrowRight && acceleration < 0) {
                        angvel.y += turnIntensity;
                    }
                }

                if(speed > 15){
                    setIsMoving(true);
                } else {
                    setIsMoving(false);
                }
                
                if (wheelsRef.current && Math.abs(acceleration) > 0.1) {
                    const wheelRotationSpeed = acceleration * physicsUpdateInterval;

                    rearWheels.rotation.x += wheelRotationSpeed;

                    const steerAngle = keys.ArrowLeft ? 0.3 : keys.ArrowRight ? -0.3 : 0;
                    const frontWheels = [leftFrontWheel, rightFrontWheel];
                    frontWheels.forEach(wheel => {
                        let vector = new THREE.Vector3(wheel.rotation.x, wheel.rotation.y, steerAngle);
                        wheel.rotation.z = steerAngle;
                        wheel.rotation.setFromVector3(vector, 'YZX');
                        wheel.rotation.x += wheelRotationSpeed;
                    });
                }

                angvel.y *= 0.95;

                rigidBody.setLinvel(linvel, true);
                rigidBody.setAngvel(angvel, true);

                // Update speed for sound effects
                setSpeed(speed);
            }

            // Always update camera and other visual elements
            if (isMoving) {
                setCarPosition(currentPos);
                
                // Get velocity and forward direction
                const velocity = rigidBody.linvel();
                const forward = forwardVec.current.clone().applyQuaternion(rigidBody.rotation());
                
                // Calculate dot product of velocity and forward direction
                const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                const dotProduct = (velocity.x * forward.x + velocity.z * forward.z) / velocityMagnitude;
                
                // If dot product is negative, we're moving backwards relative to car's forward direction
                const isReversing = dotProduct < -0.1;
                
                // Calculate camera offset based on movement direction
                const offset = new THREE.Vector3(0, 1, 0);
                const carDirection = new THREE.Vector3(0, 1.5, isReversing ? -6 : 6)
                    .applyQuaternion(rigidBody.rotation());
                
                const targetCameraPos = currentPos.clone()
                    .add(carDirection.clone().multiplyScalar(1))
                    .add(offset);

                // Smooth camera movement
                lastCameraPos.current.lerp(targetCameraPos, cameraLerpFactor);
                lastCameraTarget.current.lerp(currentPos, cameraLerpFactor);
                
                if (!vectorsAreClose(cameraState.position, lastCameraPos.current)) {
                    setCameraState({ 
                        ...cameraState, 
                        position: lastCameraPos.current, 
                        direction: lastCameraTarget.current 
                    });
                }
                
                setOrbitEnabled(false);
            } else {
                setCarPosition(currentPos);
                setOrbitEnabled(true);
            }

            if (up.y < 0.5) {
                setInvalidStateTime((prev) => prev + delta);
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
                if (invalidStateTime > 5) {
                    rigidBody.setTranslation(initialPosition.current, true);
                    rigidBody.setRotation(initialRotation.current, true);
                    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                    const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                    const carDirection = new THREE.Vector3(5, 2, 9).applyQuaternion(rigidBody.rotation());
                    const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1));
                    camera.position.lerp(cameraPosition, 0.1);
                    camera.lookAt(carPosition);
                    setInvalidStateTime(0);
                }
            } else {
                setInvalidStateTime(0);
            }
        }
    });

    // Add effect to handle reset
    useEffect(() => {
        if (carRef.current) {
            const rigidBody = carRef.current;
            
            // Only reset position if it's a manual reset (from button)
            if (resetTrigger) {
                // Reset position to initial position
                rigidBody.setTranslation({ x: 0, y: 750, z: -200 }, true);
            }
            
            // Reset rotation to upright position
            const uprightRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rigidBody.rotation().y, 0));
            rigidBody.setRotation(uprightRotation, true);
            
            // Reset velocities
            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
            
            // Reset acceleration
            setAcceleration(0);
            
            // Reset invalid state time
            setInvalidStateTime(0);
        }
    }, [resetTrigger]);

    // Add effect to handle automatic reset when car is flipped
    useEffect(() => {
        if (carRef.current && invalidStateTime > 5) {
            const rigidBody = carRef.current;
            
            // Get current position and add 10 units to Y
            const currentPos = rigidBody.translation();
            rigidBody.setTranslation({ 
                x: currentPos.x, 
                y: currentPos.y + 10, 
                z: currentPos.z 
            }, true);
            
            // Reset rotation to upright position
            const uprightRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rigidBody.rotation().y, 0));
            rigidBody.setRotation(uprightRotation, true);
            
            // Reset velocities
            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
            
            // Reset acceleration
            setAcceleration(0);
            
            // Reset invalid state time
            setInvalidStateTime(0);
        }
    }, [invalidStateTime]);

    return (
        <>
            <Car ref={carRef} wheelsRef={wheelsRef} camera={camera} />
            <CarSounds acceleration={acceleration} speed={speed} />
        </>
    );
};

export default CarControls;

