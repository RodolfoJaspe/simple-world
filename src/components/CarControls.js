import { useFrame, useThree } from '@react-three/fiber';
import nipplejs from 'nipplejs';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Car from './Car';


const CarControls = ({ setOrbitEnabled, setCarPosition }) => {
    const carRef = useRef();
    const wheelsRef = useRef({});
    const { camera } = useThree();
    const [invalidStateTime, setInvalidStateTime] = useState(0);
    const [acceleration, setAcceleration] = useState(0);
    const maxAcceleration = 50; // Max acceleration force
    const accelerationStep = 0.08; // Step to increase acceleration
    const initialPosition = useRef(new THREE.Vector3(0, 4, 0));
    const initialRotation = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)));
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
            const {
                leftFrontRim, 
                leftFrontTire, 
                rightFrontRim, 
                rightFrontTire, 
                rearRims, 
                rearTires} = wheelsRef.current;

            //initial camera position based on car position

            const rigidBody = carRef.current; 
            const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
            camera.lookAt(carPosition);
            const frontWheelPieces = [leftFrontRim,leftFrontTire,rightFrontRim,rightFrontTire]
        
            const linvel = rigidBody.linvel();
            const angvel = rigidBody.angvel();

            // Get the up vector of the car
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rigidBody.rotation());

            // Get the forward vector of the car
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(rigidBody.rotation());

            // Apply forward and backward forces with gradual acceleration
            if (keys.ArrowUp) {

                setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration));
                
            } else if (keys.ArrowDown) {
                setAcceleration((prev) => Math.max(prev - accelerationStep, -maxAcceleration));
            } 
            else {
                setAcceleration((prev) => prev * 0.98);
            }

            linvel.x = forward.x * acceleration;
            linvel.z = forward.z * acceleration;

            // Calculate the speed to scale turning
            const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);
            // Apply turning forces only if the car is moving
            if (speed > .5) {
                const turnIntensity = .05
                // const turnIntensity = Math.max(0.1, .01 - speed / 20); 
                // Scale turning based on speed
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
            }else{
                setIsMoving(false)
            }

            // Update wheels rotation
            if (wheelsRef) {
                const wheelRotationSpeed = acceleration * delta;
                rearRims.rotation.x += wheelRotationSpeed
                rearTires.rotation.x += wheelRotationSpeed

                const steerAngle = keys.ArrowLeft ? 0.5 : keys.ArrowRight ? -0.5 : 0;
                frontWheelPieces.forEach(piece => {
                    let vector = new THREE.Vector3(piece.rotation.x, piece.rotation.y, steerAngle)
                    piece.rotation.z = steerAngle
                    piece.rotation.setFromVector3(vector, 'YZX')
                    piece.rotation.x += wheelRotationSpeed
                    })
                
            }

            // Apply deceleration to angular velocity
            angvel.y *= 0.95;

            // Update the linear and angular velocities
            rigidBody.setLinvel(linvel, true);
            rigidBody.setAngvel(angvel, true);

            // Camera position adjustments to follow the car 
            if (isMoving) {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                const offset = new THREE.Vector3(0, 1, 0); // Adjust height and distance
                const carDirection = new THREE.Vector3(0, 2, 9).applyQuaternion(rigidBody.rotation());
                const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);

                camera.position.copy(cameraPosition);
                camera.lookAt(carPosition);
                setOrbitEnabled(false);
            } else {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                setCarPosition(carPosition)
                setOrbitEnabled(true);
            }

            // Check if the car is not upright
            if (up.y < 0.5) {
                setInvalidStateTime((prev) => prev + delta);
                // Disable controls if the car is not upright
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
                if (invalidStateTime > 5) {
                    console.log("crashed");
                    // Reset position and rotation
                    rigidBody.setTranslation(initialPosition.current, true);
                    rigidBody.setRotation(initialRotation.current, true);
                    // Reset velocity
                    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                    // camera reset to initial position
                    const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                    const carDirection = new THREE.Vector3(5, 2, 9).applyQuaternion(rigidBody.rotation());
                    const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1));
                    camera.position.copy(cameraPosition);
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

export default CarControls
