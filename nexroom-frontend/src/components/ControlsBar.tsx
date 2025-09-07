import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';

//Define the props the componenet will receive
interface ControlsBarProps {
    isMicOn: boolean;
    isCameraOn: boolean;
    toggleMic: () => void;
    toggleCamera: () => void;
}
const ControlsBar: React.FC<ControlsBarProps> = ({isMicOn, isCameraOn, toggleMic, toggleCamera}) => {

    return (
        <Box sx = {{ display: 'flex', justifyContent: 'center', p: 2}}>
            {/* Mic toggle button */}
            <IconButton
                onClick = {toggleMic}
                sx = {{ color: 'white', 
                        backgroundColor: isMicOn ? '#3c4043' : '#ea4335', 
                        mx: 1 }}>
                {isMicOn ? <MicIcon/> : <MicOffIcon/>}
            </IconButton>

            {/* Cam toggle button */}
            <IconButton
                onClick = {toggleCamera}
                sx = {{ color: 'white', 
                        backgroundColor: isCameraOn ? '#3c4043' : '#ea4335', 
                        mx: 1 }}>
                {isCameraOn ? <VideocamIcon/> : <VideocamOffIcon/>}
            </IconButton>
            
            {/* Screen Share button */}
            <IconButton
                sx = {{ color: 'white', 
                        backgroundColor: '#3c4043',
                        mx: 1 }}>
                <ScreenShareIcon/>
            </IconButton>

            {/* Leave Call button */}
            <IconButton
                sx = {{ color: 'white', 
                        backgroundColor: '#ea4335',
                        mx: 1 }}>
                <CallEndIcon />
            </IconButton>

        </Box>
    );
};

export default ControlsBar;