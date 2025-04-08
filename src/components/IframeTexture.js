import { Html } from '@react-three/drei';
import React, { useRef } from 'react';

const IframeTexture = ({ project }) => {
    const meshRef = useRef();
    const iframeRef = useRef();
    const {url, position, rotation, iframeScale, width, height, name, techStack, style } = project

    const {titleH2, techP, clickButtonH2} = style
    console.log(titleH2)

    return (
        <>
            <mesh ref={meshRef} position={position} rotation={rotation} >
                <planeGeometry args={[10, 5, 1]} />
                <meshBasicMaterial color="white" />
                <Html 
                    transform 
                    ref={iframeRef}
                    position={[0, 0, 0.1]} rotation={[0, 0, 0]}
                    scale={iframeScale}
                    style={{
                        // backgroundColor : "red",
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                        }}>
                            
                        <div style={{
                            width: '60vw',
                            // backgroundColor: 'green',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-evenly'}}>
                            <div style={{
                                // backgroundColor: "orange",
                                textAlign: "right"
                            }}>
                                {name.split(' ').map((word,i) => <h2 style={{
                                fontSize: titleH2.fontSize,
                                paddingRight: titleH2.paddingRight,
                                color: titleH2.color,
                                textShadow: titleH2.textShadow,
                                backgroundColor: titleH2.backgroundColor,
                                    margin: titleH2.margin
                                }} key={i}>
                                    {word}
                                </h2>)} 
                            </div>
                            <div style={{
                                // backgroundColor : "purple",
                                textAlign: "right"}}>
                               {techStack.map((tech,i) => <p style={{
                                fontSize: techP.fontSize,
                                paddingRight: techP.paddingRight,
                                color: techP.color,
                                margin: techP.margin,
                                fontWeight: techP.fontWeight
                                }} key={i}>
                                    {tech}
                                </p>)} 
                            </div>
                            <div style={{
                                // backgroundColor : "purple",
                                textAlign: "right"}}>
                                <a 
                                    href={url}
                                    target="_blank"
                                    style={{
                                        textDecoration:'none',
                                        fontSize:'2rem',
                                        color: titleH2.color,
                                        paddingRight: titleH2.paddingRight,
                                        textShadow: titleH2.textShadow
                                    }}>{url.slice(8)}
                                </a>
                            </div>
                        </div>
                        <iframe
                            src={url}
                            style={{
                                border: 'none',
                                width: `${width * 100}px`, 
                                height: `${height * 100}px`, 
                            }}
                            title="Project Iframe"/>
                        <div style={{
                            width: '60vw',
                            // backgroundColor: 'pink',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start'}}>
                            {'Click red button to close'.split(' ').map((word,i) => <h2 style={{
                                fontSize: clickButtonH2.fontSize,
                                paddingLeft: clickButtonH2.paddingLeft,
                                margin: clickButtonH2.margin,
                                color: clickButtonH2.color,
                                textShadow: clickButtonH2.textShadow,
                            }} key={i}>
                                {word}
                            </h2>)}
                        </div>
                </Html>
            </mesh>
        </>

    );
};

export default IframeTexture;

