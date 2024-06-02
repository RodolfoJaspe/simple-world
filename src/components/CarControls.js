// import { useFrame, useThree } from '@react-three/fiber';
import nipplejs from 'nipplejs';
// import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// import Car from './Car';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import Car from './Car';

const CarControls = ({ setOrbitEnabled, setCarPosition }) => {
    const carRef = useRef();
    console.log(carRef)
    const { camera } = useThree();
    const [invalidStateTime, setInvalidStateTime] = useState(0);
    const [acceleration, setAcceleration] = useState(0);
    const maxAcceleration = 50; // Max acceleration force
    const accelerationStep = 0.08; // Step to increase acceleration
    const initialPosition = useRef(new THREE.Vector3(0, 1, 0));
    const initialRotation = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)));
    const [isMoving, setIsMoving] = useState(false);

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

        // Initialize the joystick
        const joystick = nipplejs.create({
            zone: document.getElementById('joystick-container'),
            mode: 'static',
            position: { left: '50%', bottom: '50px' },
            color: 'blue'
        });

        joystick.on('move', (evt, data) => {
            const { angle, force } = data;
            if (angle.degree > 45 && angle.degree < 135) {
                keys.ArrowUp = true;
                keys.ArrowDown = false;
            } else if (angle.degree > 225 && angle.degree < 315) {
                keys.ArrowUp = false;
                keys.ArrowDown = true;
            } else {
                keys.ArrowUp = false;
                keys.ArrowDown = false;
            }

            if (angle.degree > 135 && angle.degree < 225) {
                keys.ArrowLeft = true;
                keys.ArrowRight = false;
            } else if (angle.degree > 315 || angle.degree < 45) {
                keys.ArrowLeft = false;
                keys.ArrowRight = true;
            } else {
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
            }
        });

        joystick.on('end', () => {
            keys.ArrowUp = false;
            keys.ArrowDown = false;
            keys.ArrowLeft = false;
            keys.ArrowRight = false;
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            joystick.destroy();
        };
    }, [keys]);

    useFrame((state, delta) => {
        if (carRef.current) {
            const rigidBody = carRef.current;
            console.log(rigidBody)
            const { rightFrontRim, leftFrontRim,rearRims, rightFrontTire,leftFrontTire,rearTires} = rigidBody.userData;
            const linvel = rigidBody.linvel();
            const angvel = rigidBody.angvel();

            // Get the up vector of the car
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rigidBody.rotation());

            // Check if the car is not upright
            if (up.y < 0.5) {
                setInvalidStateTime((prev) => prev + delta);
                // Disable controls if the car is not upright
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
                if (invalidStateTime > 5) {
                    rigidBody.setTranslation(initialPosition.current, true);
                    rigidBody.setRotation(initialRotation.current, true);
                    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                    setInvalidStateTime(0);
                }
            } else {
                setInvalidStateTime(0);
            }

            // Get the forward vector of the car
            const forward = new THREE.Vector3(Math.PI / 2, 0, -Math.PI / 2);
            forward.applyQuaternion(rigidBody.rotation());

            // Apply forward and backward forces with gradual acceleration
            if (keys.ArrowUp) {
                setAcceleration((prev) => Math.min(prev - accelerationStep, maxAcceleration));
                
            } else if (keys.ArrowDown) {
                setAcceleration((prev) => Math.max(prev + accelerationStep, -maxAcceleration));
            } else {
                setAcceleration((prev) => prev * 0.98);
            }

            linvel.x = forward.x * acceleration;
            linvel.z = forward.z * acceleration;

            // Calculate the speed to scale turning
            const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

            // Apply turning forces only if the car is moving
            if (speed > 1) {
                const turnIntensity = Math.max(0.1, .01 - speed / 20); // Scale turning based on speed
                if (keys.ArrowLeft) {
                    angvel.y += turnIntensity;
                }
                if (keys.ArrowRight) {
                    angvel.y -= turnIntensity;
                }
            }
            if(speed > 10){
                setIsMoving(true);
            }else{
                setIsMoving(false)
            }

            // Apply deceleration to angular velocity
            angvel.y *= 0.95;

            // Update the linear and angular velocities
            rigidBody.setLinvel(linvel, true);
            rigidBody.setAngvel(angvel, true);

            // Rotate the wheels
            const wheelRotationSpeed = acceleration * delta;
            rightFrontRim.rotation.x += wheelRotationSpeed;
            rearRims.rotation.x += wheelRotationSpeed;
            rightFrontTire.rotation.x += wheelRotationSpeed;
            leftFrontTire.rotation.x += wheelRotationSpeed;
            rearTires.rotation.x += wheelRotationSpeed;

            // // Update wheels rotation
            // const { wheels } = carRef.current.userData;
            // if (wheels) {
            //     const wheelRotationSpeed = speed * .1   ;
            //     wheels.front.rotation.x += wheelRotationSpeed;
            //     wheels.rear.rotation.x += wheelRotationSpeed;

            //     if (keys.ArrowLeft || keys.ArrowRight) {
            //         const steerAngle = keys.ArrowLeft ? 0.5 : keys.ArrowRight ? -0.5 : 0;
            //         wheels.front.rotation.y = steerAngle;
            //     } else {
            //         wheels.front.rotation.y = 0;
            //     }
            // }           

            // Camera position adjustments to follow the car 
            if (isMoving) {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                const offset = new THREE.Vector3(0, 1, -Math.PI / 1); // Adjust height and distance
                const carDirection = new THREE.Vector3(7, 2, -9).applyQuaternion(rigidBody.rotation());
                const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);

                camera.position.copy(cameraPosition);
                camera.lookAt(carPosition);
                setOrbitEnabled(false);
            } else {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                setCarPosition(carPosition)
                setOrbitEnabled(true);
            }
        }
    });

    return <Car ref={carRef} camera={camera} />;
};

export default CarControls




// import { useFrame, useThree } from '@react-three/fiber';
// import nipplejs from 'nipplejs';
// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import Car from './Car';

// const CarControls = ({ setOrbitEnabled, setCarPosition }) => {
//     const carRef = useRef();
//     console.log(carRef)
//     const { camera } = useThree();
//     const [invalidStateTime, setInvalidStateTime] = useState(0);
//     const [acceleration, setAcceleration] = useState(0);
//     const maxAcceleration = 50; // Max acceleration force
//     const accelerationStep = 0.08; // Step to increase acceleration
//     const initialPosition = useRef(new THREE.Vector3(0, 1, 0));
//     const initialRotation = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)));
//     const [isMoving, setIsMoving] = useState(false);

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

//         // Initialize the joystick
//         const joystick = nipplejs.create({
//             zone: document.getElementById('joystick-container'),
//             mode: 'static',
//             position: { left: '50%', bottom: '50px' },
//             color: 'blue'
//         });

//         joystick.on('move', (evt, data) => {
//             const { angle, force } = data;
//             if (angle.degree > 45 && angle.degree < 135) {
//                 keys.ArrowUp = true;
//                 keys.ArrowDown = false;
//             } else if (angle.degree > 225 && angle.degree < 315) {
//                 keys.ArrowUp = false;
//                 keys.ArrowDown = true;
//             } else {
//                 keys.ArrowUp = false;
//                 keys.ArrowDown = false;
//             }

//             if (angle.degree > 135 && angle.degree < 225) {
//                 keys.ArrowLeft = true;
//                 keys.ArrowRight = false;
//             } else if (angle.degree > 315 || angle.degree < 45) {
//                 keys.ArrowLeft = false;
//                 keys.ArrowRight = true;
//             } else {
//                 keys.ArrowLeft = false;
//                 keys.ArrowRight = false;
//             }
//         });

//         joystick.on('end', () => {
//             keys.ArrowUp = false;
//             keys.ArrowDown = false;
//             keys.ArrowLeft = false;
//             keys.ArrowRight = false;
//         });

//         return () => {
//             window.removeEventListener('keydown', handleKeyDown);
//             window.removeEventListener('keyup', handleKeyUp);
//             joystick.destroy();
//         };
//     }, [keys]);

//     useFrame((state, delta) => {
//         if (carRef.current) {
//             const rigidBody = carRef.current;
//             console.log(rigidBody)
//             const { rightFrontRim,leftFrontRim,rearRims,rightFrontTire,leftFrontTire, rearTires } = rigidBody.userData;

//             const linvel = rigidBody.linvel();
//             const angvel = rigidBody.angvel();

//             // Get the up vector of the car
//             const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rigidBody.rotation());

//             // Check if the car is not upright
//             if (up.y < 0.5) {
//                 setInvalidStateTime((prev) => prev + delta);
//                 // Disable controls if the car is not upright
//                 keys.ArrowUp = false;
//                 keys.ArrowDown = false;
//                 keys.ArrowLeft = false;
//                 keys.ArrowRight = false;
//                 if (invalidStateTime > 5) {
//                     rigidBody.setTranslation(initialPosition.current, true);
//                     rigidBody.setRotation(initialRotation.current, true);
//                     rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
//                     rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
//                     setInvalidStateTime(0);
//                 }
//             } else {
//                 setInvalidStateTime(0);
//             }

//             // Get the forward vector of the car
//             const forward = new THREE.Vector3(0, 0, -1);
//             forward.applyQuaternion(rigidBody.rotation());

//             // Apply forward and backward forces with gradual acceleration
//             if (keys.ArrowUp) {
//                 setAcceleration((prev) => Math.min(prev - accelerationStep, maxAcceleration));
                
//             } else if (keys.ArrowDown) {
//                 setAcceleration((prev) => Math.max(prev + accelerationStep, -maxAcceleration));
//             } else {
//                 setAcceleration((prev) => prev * 0.98);
//             }

//             linvel.x = forward.x * acceleration;
//             linvel.z = forward.z * acceleration;

//             // Calculate the speed to scale turning
//             const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

//             // Apply turning forces only if the car is moving
//             if (speed > 1) {
//                 const turnIntensity = Math.max(0.1, .01 - speed / 20); // Scale turning based on speed
//                 if (keys.ArrowLeft) {
//                     angvel.y += turnIntensity;
//                 }
//                 if (keys.ArrowRight) {
//                     angvel.y -= turnIntensity;
//                 }
//             }
//             if(speed > 10){
//                 setIsMoving(true);
//             }else{
//                 setIsMoving(false)
//             }

//             // Apply deceleration to angular velocity
//             angvel.y *= 0.95;

//             // Update the linear and angular velocities
//             rigidBody.setLinvel(linvel, true);
//             rigidBody.setAngvel(angvel, true);

//             // // Rotate the wheels
//             // const wheelRotationSpeed = acceleration * delta;
//             // front.rotation.x += wheelRotationSpeed;
//             // rear.rotation.x += wheelRotationSpeed;

//             // Update wheels rotation
//             if (rigidBody.userData) {
//                 const wheelRotationSpeed = speed * .1   ;
//                 leftFrontRim.rotation.x += wheelRotationSpeed;
//                 leftFrontTire.rotation.x += wheelRotationSpeed;
//                 rightFrontRim.rotation.x += wheelRotationSpeed;
//                 rightFrontTire.rotation.x += wheelRotationSpeed;
//                 rearRims.rotation.x += wheelRotationSpeed;
//                 rearTires.rotation.x += wheelRotationSpeed;

//                 if (keys.ArrowLeft || keys.ArrowRight) {
//                     const steerAngle = keys.ArrowLeft ? 0.5 : keys.ArrowRight ? -0.5 : 0;
//                     leftFrontRim.rotation.z = steerAngle;
//                     rightFrontRim.rotation.z = steerAngle;
//                     leftFrontTire.rotation.z = steerAngle;
//                     rightFrontTire.rotation.z = steerAngle;
//                 } else {
//                     leftFrontRim.rotation.z = 0;
//                     rightFrontRim.rotation.z = 0;
//                     leftFrontTire.rotation.z = 0;
//                     rightFrontTire.rotation.z = 0;
//                 }
//             }           

//             // Camera position adjustments to follow the car 
//             if (isMoving) {
//                 const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
//                 const offset = new THREE.Vector3(0, 1, 0); // Adjust height and distance
//                 const carDirection = new THREE.Vector3(0, 2, -9).applyQuaternion(rigidBody.rotation());
//                 const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);

//                 camera.position.copy(cameraPosition);
//                 camera.lookAt(carPosition);
//                 setOrbitEnabled(false);
//             } else {
//                 const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
//                 setCarPosition(carPosition)
//                 setOrbitEnabled(true);
//             }
//         }
//     });

//     return <Car ref={carRef} camera={camera} />;
// };

// export default CarControls




