import { Html } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';

const VideoTexture = ({ videoUrl, position, rotation, scale }) => {
    const videoRef = useRef(null);
    const [videoVisibility, setVideoVisibility] = useState(false)

    useEffect(() => {
        if (videoRef.current) {
            console.log('Video element:', videoRef.current);
            videoRef.current.play().catch(error => {
                console.error('Error attempting to play:', error);
            });
        }
    }, []);    

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[10, 5, 1]} />
            <meshBasicMaterial color="white" />
            <Html
                transform
                position={[0, 0, 0.1]}
                scale={scale}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    // backgroundColor: 'red'
                }}>
                <div onMouseOver={() => setVideoVisibility(true)} onMouseLeave={() => setVideoVisibility(false)}>
                    <iframe
                        width="415"
                        height="300"
                        src={`https://www.youtube.com/embed/${videoUrl}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded YouTube video"
                        style={{scale: videoVisibility? '1': '0', zIndex: '-100'}}
                        className='riptide-video'
                    />
                </div>    
                
            </Html>
        </mesh>
    );
};

export default VideoTexture;
