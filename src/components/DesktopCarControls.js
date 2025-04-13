import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCameraState } from '../state/CameraStateContext';
import Car from './Car';

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
    const [invalidStateTime, setInvalidStateTime] = useState(0);
    const [acceleration, setAcceleration] = useState(0);
    const maxAcceleration = 100; // Max acceleration force
    const accelerationStep = 0.08; // Step to increase acceleration
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
            }

            // Always update camera and other visual elements
            if (isMoving) {
                const currentCarPos = new THREE.Vector3(
                    rigidBody.translation().x,
                    rigidBody.translation().y,
                    rigidBody.translation().z
                );
                setCarPosition(currentCarPos);
                
                const offset = new THREE.Vector3(0, 1, 0);
                const carDirection = new THREE.Vector3(0, 1.5, 6).applyQuaternion(rigidBody.rotation());
                const targetCameraPos = currentCarPos.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);
                
                // Smooth camera movement
                lastCameraPos.current.lerp(targetCameraPos, cameraLerpFactor);
                lastCameraTarget.current.lerp(currentCarPos, cameraLerpFactor);
                
                if (!vectorsAreClose(cameraState.position, lastCameraPos.current)) {
                    setCameraState({ 
                        ...cameraState, 
                        position: lastCameraPos.current, 
                        direction: lastCameraTarget.current 
                    });
                }
                setOrbitEnabled(false);
            } else {
                const currentCarPos = new THREE.Vector3(
                    rigidBody.translation().x,
                    rigidBody.translation().y,
                    rigidBody.translation().z
                );
                setCarPosition(currentCarPos);
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

    return <Car ref={carRef} wheelsRef={wheelsRef} camera={camera} />;
};

export default CarControls;

// old code
// import { useFrame } from '@react-three/fiber';
// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { useCameraState } from '../state/CameraStateContext';
// import Car from './Car';

// const CarControls = ({ setOrbitEnabled, carPosition, setCarPosition, camera, isMoving, setIsMoving }) => {
//     const carRef = useRef();
//     const wheelsRef = useRef({});
//     const { cameraState, setCameraState } = useCameraState();
//     const [invalidStateTime, setInvalidStateTime] = useState(0);
//     const [acceleration, setAcceleration] = useState(0);
//     const maxAcceleration = 200; // Max acceleration force
//     const accelerationStep = 0.08; // Step to increase acceleration
//     const initialPosition = useRef(new THREE.Vector3(0, 700, -200));
//     const initialRotation = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)));

//     const keys = useRef({
//         ArrowUp: false,
//         ArrowDown: false,
//         ArrowLeft: false,
//         ArrowRight: false,
//     }).current;

//     useEffect(() => {
//         const handleKeyDown = (event) => {
//             if (keys[event.key] !== undefined) {
//                 keys[event.key] = true;
//             }
//         };

//         const handleKeyUp = (event) => {
//             if (keys[event.key] !== undefined) {
//                 keys[event.key] = false;
//             }
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         window.addEventListener('keyup', handleKeyUp);

//         return () => {
//             window.removeEventListener('keydown', handleKeyDown);
//             window.removeEventListener('keyup', handleKeyUp);
//         };
//     }, [keys]);

//     useFrame((state, delta) => {
//         if (carRef.current && cameraState.followingCar) {
//             const {
//                 leftFrontWheel, 
//                 rightFrontWheel, 
//                 rearWheels, 
//                 } = wheelsRef.current;

//             const rigidBody = carRef.current; 
//             setCarPosition(new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z))
//             const frontWheels = [leftFrontWheel,rightFrontWheel]
        
//             const linvel = rigidBody.linvel();
//             const angvel = rigidBody.angvel();

//             const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rigidBody.rotation());
//             const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(rigidBody.rotation());

//             if (keys.ArrowUp) {
//                 setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration));
//             } else if (keys.ArrowDown) {
//                 setAcceleration((prev) => Math.max(prev - accelerationStep, -maxAcceleration));
//             } else {
//                 setAcceleration((prev) => prev * 0.98);
//             }

//             linvel.x = forward.x * acceleration;
//             linvel.z = forward.z * acceleration;

//             const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);
//             if (speed > .5) {
//                 const turnIntensity = 0.1 - speed / 2000;
//                 if (keys.ArrowLeft && acceleration > 0) { 
//                     angvel.y += turnIntensity;
//                 }
//                 if (keys.ArrowRight && acceleration > 0) {
//                     angvel.y -= turnIntensity;
//                 }
//                 if (keys.ArrowLeft && acceleration < 0) {
//                     angvel.y -= turnIntensity;
//                 }
//                 if (keys.ArrowRight && acceleration < 0) {
//                     angvel.y += turnIntensity;
//                 }
//             }
//             if(speed > 15){
//                 setIsMoving(true);
//             }else{
//                 setIsMoving(false)
//             }

//             if (wheelsRef) {
//                 const wheelRotationSpeed = acceleration * delta;
//                 rearWheels.rotation.x += wheelRotationSpeed

//                 const steerAngle = keys.ArrowLeft ? 0.3 : keys.ArrowRight ? -0.3 : 0;
//                 frontWheels.forEach(wheel => {
//                     let vector = new THREE.Vector3(wheel.rotation.x, wheel.rotation.y, steerAngle)
//                     wheel.rotation.z = steerAngle
//                     wheel.rotation.setFromVector3(vector, 'YZX')
//                     wheel.rotation.x += wheelRotationSpeed
//                 })
//             }

//             angvel.y *= 0.95;

//             rigidBody.setLinvel(linvel, true);
//             rigidBody.setAngvel(angvel, true);

//             if (isMoving) {
//                 setCarPosition(new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z))
//                 const offset = new THREE.Vector3(0, 1, 0);
//                 const carDirection = new THREE.Vector3(0, 2, 5).applyQuaternion(rigidBody.rotation());
//                 const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);
//                 setCameraState({
//                     ...cameraState, 
//                     position: cameraPosition, 
//                     direction: carPosition})
//                 setOrbitEnabled(false);
//             } else {
//                 setCarPosition(new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z))
//                 setOrbitEnabled(true);
//             }

//             if (up.y < 0.5) {
//                 setInvalidStateTime((prev) => prev + delta);
//                 keys.ArrowUp = false;
//                 keys.ArrowDown = false;
//                 keys.ArrowLeft = false;
//                 keys.ArrowRight = false;
//                 if (invalidStateTime > 5) {
//                     console.log("crashed");
//                     rigidBody.setTranslation(initialPosition.current, true);
//                     rigidBody.setRotation(initialRotation.current, true);
//                     rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
//                     rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
//                     const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
//                     const carDirection = new THREE.Vector3(5, 2, 9).applyQuaternion(rigidBody.rotation());
//                     const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1));
//                     camera.position.copy(cameraPosition);
//                     camera.lookAt(carPosition);
//                     setInvalidStateTime(0);
//                 }
//             } else {
//                 setInvalidStateTime(0);
//             }
//         }
//     });

//     return <Car ref={carRef} wheelsRef={wheelsRef} camera={camera} />;
// };

// export default CarControls;