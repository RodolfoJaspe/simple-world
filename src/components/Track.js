import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

import React from 'react';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Track () {
    const gltf = useLoader(GLTFLoader, '/Assets/track2/scene.gltf');

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
        }
    });

    

    // const lamps = [[-128,11,77],[-140,11,74.5],[-153,8,132],[-141,8,138],[-203,6,165],[-191,6,173],[-242,6,246],[-229,6,253],[-277,6,320],[-288,6,313],[-229,6,440],[-229,6,426],[-155,6,404],[-148,6,415],[-88,6,357],[-80,6,368],[125,6,238.5],[122,6,226],[204.5,6,234],[204.5,6,220],[286.5,6,220],[286.5,7,234],[366,10,243],[368.5,11,230],[449,14,235],[442,13,224.5],[483,17,163],[497,18,163.8],[458,25,93],[467,25,83],[388,25,54],[388,25,70],[323,21,23],[313,21,33],[262,16,-7],[262,16,7],[197,6,6.5],[197,6,-8],[92.2,6.5,-32.2],[83.5,7,-21],[94,6,-8],[94,6,8],[-56.8,9,7],[-56.8,9,-7],[-107.4,12,26.2],[-116.5,11,16]]

    return (
        <RigidBody type="fixed" colliders='trimesh' position={[-200, 680, -200]}>
            <primitive object={gltf.scene} scale={1} receiveShadow />
            {/* {lamps.map((lamp, i) => (<pointLight position={lamp} intensity={40} key={i}/>))} */}
        </RigidBody>
    );
};

export default React.memo(Track)