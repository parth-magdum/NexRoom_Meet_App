import React from 'react';
import { Grid } from '@mui/material';
import VideoPlayer from './VideoPlayer';
import { PermMediaRounded, Stream } from '@mui/icons-material';

interface VideoGridProps {
    myStream: MediaStream | null;
    remoteStreams: Record<string, MediaStream>;
}

// //dummy data for now 
// const participants = [
//   { id: '1', name: 'Alex' },
//   { id: '2', name: 'Ben' },
// ];

const VideoGrid:React.FC<VideoGridProps> = ({myStream, remoteStreams}) => {
    return (
        <Grid container spacing={2} sx = {{ p: 2}}>
            {/* My Video */}
            {myStream && (
                <Grid item xs={12} sm={6} md={4}>
                    <VideoPlayer name="You" stream={myStream} isMuted={true} />
                </Grid>
            )}

            {/* Othe participant's videos (as placeholders for niw) */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
                <Grid item xs={12} sm={6} md ={4} key ={peerId}>
                    <VideoPlayer name ={`Peer ${peerId.substring(0,6)}`} stream = {stream} />
                </Grid>
            ))}
        </Grid>
    );
};

export default VideoGrid;