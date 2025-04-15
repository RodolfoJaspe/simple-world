import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CarSounds = ({ acceleration, speed }) => {
    const audioListener = useRef(new THREE.AudioListener());
    const engineSound = useRef(new THREE.Audio(audioListener.current));
    const audioLoader = useRef(new THREE.AudioLoader());

    // Gear ranges and pitch settings
    const gearRanges = {
        1: { min: 0, max: 30, basePitch: 0.8, maxPitch: 1.8 },
        2: { min: 30, max: 70, basePitch: 1.1, maxPitch: 1.8 },
        3: { min: 70, max: 120, basePitch: 1.2, maxPitch: 1.8 },
        4: { min: 120, max: 200, basePitch: 1.4, maxPitch: 1.8 }
    };

    const calculatePitch = (currentSpeed) => {
        // Find current gear
        let currentGear = 1;
        for (let gear = 1; gear <= 4; gear++) {
            if (currentSpeed >= gearRanges[gear].min && currentSpeed <= gearRanges[gear].max) {
                currentGear = gear;
                break;
            }
        }

        const gear = gearRanges[currentGear];
        const gearProgress = (currentSpeed - gear.min) / (gear.max - gear.min);
        
        // Add rev limiter effect when approaching gear max
        if (gearProgress > 0.9) {
            // Oscillate pitch slightly for rev limiter effect
            const limiterEffect = Math.sin(Date.now() * 0.1) * 0.1;
            return gear.maxPitch + limiterEffect;
        }

        // Normal gear progression
        return gear.basePitch + (gearProgress * (gear.maxPitch - gear.basePitch));
    };

    useEffect(() => {
        console.log('Attempting to load engine sound...');
        
        // Load engine sound
        audioLoader.current.load(
            '/Assets/sounds/engine.mp3',
            (buffer) => {
                console.log('Engine sound loaded successfully');
                engineSound.current.setBuffer(buffer);
                engineSound.current.setLoop(true);
                engineSound.current.setVolume(0.5);
                try {
                    engineSound.current.play();
                    console.log('Engine sound started playing');
                } catch (error) {
                    console.error('Error playing engine sound:', error);
                }
            },
            (xhr) => {
                console.log('Loading progress:', (xhr.loaded / xhr.total) * 100 + '%');
            },
            (error) => {
                console.error('Error loading engine sound:', error);
            }
        );

        return () => {
            console.log('Cleaning up engine sound');
            engineSound.current.stop();
        };
    }, []);

    useEffect(() => {
        if (engineSound.current.isPlaying) {
            // Calculate pitch based on gear system
            const pitch = calculatePitch(speed);
            engineSound.current.setPlaybackRate(Math.max(0.8, Math.min(2.0, pitch)));

            // Adjust volume based on acceleration
            const volume = 0.3 + Math.abs(acceleration) / 200;
            engineSound.current.setVolume(Math.max(0.3, Math.min(1, volume)));
        }
    }, [acceleration, speed]);

    return null;
};

export default CarSounds; 