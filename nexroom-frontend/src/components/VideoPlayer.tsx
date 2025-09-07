import React, {useEffect, useRef} from 'react';
import { Box, Typography } from '@mui/material';
import {useAudioLevel} from '../hooks/useAudioLevel';

interface VideoPlayerProps {
    name: string;
    stream?: MediaStream //Stream can be optional
    isMuted?: boolean //to mute our own video
}

const SPEAKING_THRESHOLD = 15; //for changing sensitivity

const VideoPlayer: React.FC<VideoPlayerProps> = ({name, stream, isMuted}) => {
    // console.log(`Rendering VideoPlayer for "${name}"`, { stream });

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioLevel = useAudioLevel(stream);

    //This effect runs when the stream prop changes
    useEffect(() => {
        if (videoRef.current && stream) {
            //Attach stream to video element's srcObject
            videoRef.current.srcObject = stream;

            //manually trigger play and catch potential errors
            videoRef.current.play().catch( error => 
                console.error('Autoplay was prevented for this video', error)
            );
        }
    }, [stream]);
    
    //Determine if the user is speaking based on the threshold
    const isSpeaking = audioLevel > SPEAKING_THRESHOLD;

    return (
    <Box 
      sx={{ 
        backgroundColor: 'black', 
        borderRadius: 2, 
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '56.25%',
        //border for speaking indicator
        border:isSpeaking ? '3px solid #8ab4f8' : '3px solid transparent',
        transition: 'border-color 0.3s ease', //smooth transition for the border
        boxSizing: 'border-box', //Ensures the border doesn't change the element's size
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        // ---THREE EVENT LISTENERS ---
        onLoadedMetadata={() => console.log(`Video metadata loaded for "${name}"`)}
        onPlaying={() => console.log(`%cVideo is playing for "${name}"`, "color: lightgreen; font-weight: bold;")}
        onError={(e) => console.error(`Video error for "${name}":`, e)}
        // ---END OF NEW LISTENERS ---
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 8, 
          left: 8, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '2px 8px',
          borderRadius: 1,
        }}
      >
        <Typography sx={{ color: 'white' }}>{name}</Typography>
      </Box>
    </Box>
  );
};

export default VideoPlayer; 