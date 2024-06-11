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
    const [followCamera, setFollowCamera] = useState(false);
    const [turnAngle, setTurnAngle] = useState(0);

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
            color: 'white'
        });

        joystick.on('move', (evt, data) => {
            const { angle, force } = data;
            setTurnAngle(angle.radian);

            if (angle.degree > 0 && angle.degree < 180) {
                keys.ArrowUp = true;
                keys.ArrowDown = false;
            } else if (angle.degree > 180 && angle.degree < 360) {
                keys.ArrowUp = false;
                keys.ArrowDown = true;
            } else {
                keys.ArrowUp = false;
                keys.ArrowDown = false;
            }
        });

        joystick.on('end', () => {
            keys.ArrowUp = false;
            keys.ArrowDown = false;
            keys.ArrowLeft = false;
            keys.ArrowRight = false;
            setTurnAngle(0);
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            joystick.destroy();
        };
    }, []);

    useFrame((state, delta) => {
        if (carRef.current) {
            const {
                leftFrontRim, 
                leftFrontTire, 
                rightFrontRim, 
                rightFrontTire, 
                rearRims, 
                rearTires
            } = wheelsRef.current;

            const rigidBody = carRef.current;
            const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
            camera.lookAt(carPosition);
            const frontWheelPieces = [leftFrontRim, leftFrontTire, rightFrontRim, rightFrontTire];
        
            const linvel = rigidBody.linvel();
            const angvel = rigidBody.angvel();

            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rigidBody.rotation());

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(rigidBody.rotation());

            if(0 < turnAngle && turnAngle < .5 || 2.5 < turnAngle && turnAngle < 3){
                setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration/3));
            }else if(.5 < turnAngle && turnAngle < 1 || 2 < turnAngle && turnAngle < 2.5){
                setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration/2));
            }else if(1 < turnAngle && turnAngle < 2){
                setAcceleration((prev) => Math.min(prev + accelerationStep, maxAcceleration));
            }else if(3 < turnAngle && turnAngle < 3.5 || 5.5 < turnAngle && turnAngle < 6){
                setAcceleration((prev) => Math.min(prev - accelerationStep, -maxAcceleration/20));
            }else if(3.5 < turnAngle && turnAngle < 4 || 5 < turnAngle && turnAngle < 5.5){
                setAcceleration((prev) => Math.min(prev - accelerationStep, -maxAcceleration/20));
            }else if(4 < turnAngle && turnAngle < 5){
                setAcceleration((prev) => Math.min(prev - accelerationStep, -maxAcceleration/20));
            }else {
                setAcceleration((prev) => prev * 0.98);
            }

            linvel.x = forward.x * acceleration;
            linvel.z = forward.z * acceleration;

            const speed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

            if (speed > 0.5) {
                console.log(turnAngle)
                if (0 < turnAngle && turnAngle < 1.3){
                    angvel.y -= turnAngle / 20;
                }
                if (1.7 < turnAngle && turnAngle < 3){
                    angvel.y += turnAngle / 60;
                }
                if (3 < turnAngle && turnAngle < 4.3){
                    angvel.y -= turnAngle / 60;
                }
                if (4.7 < turnAngle && turnAngle < 6){
                    angvel.y += turnAngle / 60;
                }
            }

            if (speed > 15) {
                setFollowCamera(true);
            } else {
                setFollowCamera(false);
            }

            // Update wheels rotation
            if (wheelsRef) {
                const wheelRotationSpeed = acceleration * delta;
                rearRims.rotation.x += wheelRotationSpeed
                rearTires.rotation.x += wheelRotationSpeed

                let steerAngle = 0
                if (0 < turnAngle && turnAngle < 1.3){
                    steerAngle = -0.5
                }
                if (1.7 < turnAngle && turnAngle < 3){
                    steerAngle = 0.5
                }
                if (3 < turnAngle && turnAngle < 4.3){
                    steerAngle = 0.5
                }
                if (4.7 < turnAngle && turnAngle < 6){
                    steerAngle = -0.5
                }
                frontWheelPieces.forEach(piece => {
                    let vector = new THREE.Vector3(piece.rotation.x, piece.rotation.y, steerAngle)
                    piece.rotation.z = steerAngle
                    piece.rotation.setFromVector3(vector, 'YZX')
                    piece.rotation.x += wheelRotationSpeed
                    })
                
            }

            angvel.y *= 0.95;

            rigidBody.setLinvel(linvel, true);
            rigidBody.setAngvel(angvel, true);

            if (followCamera) {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                const offset = new THREE.Vector3(0, 1, 0);
                const carDirection = new THREE.Vector3(0, 2, 9).applyQuaternion(rigidBody.rotation());
                const cameraPosition = carPosition.clone().add(carDirection.clone().multiplyScalar(1)).add(offset);

                camera.position.copy(cameraPosition);
                camera.lookAt(carPosition);
                setOrbitEnabled(false);
            } else {
                const carPosition = new THREE.Vector3(rigidBody.translation().x, rigidBody.translation().y, rigidBody.translation().z);
                setCarPosition(carPosition);
                setOrbitEnabled(true);
            }

            if (up.y < 0.5) {
                setInvalidStateTime((prev) => prev + delta);
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
                if (invalidStateTime > 5) {
                    console.log("crashed");
                    rigidBody.setTranslation(initialPosition.current, true);
                    rigidBody.setRotation(initialRotation.current, true);
                    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
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

export default CarControls;

