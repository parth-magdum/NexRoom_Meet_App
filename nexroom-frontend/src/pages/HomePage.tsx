import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import {Button, TextField, Typography, Container, Box} from '@mui/material';
import {v4 as uuidV4} from 'uuid';

const HomePage = () => {

    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');

    //to create new room
    const createNewRoom = () => {
        const newRoomId = uuidV4();
        navigate(`/room/${newRoomId}`);
    };

    //to join existing room
    const joinRoom = () => {
        if(roomId) {
            navigate(`/room/${roomId}`);
        } else {
            alert('Please enter a Room ID.')
        }
    };


    return (
        <Container maxWidth="sm">
            <Box
            sx= {{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2, 
                }}
                >
                <Typography component="h1" variant = "h4">
                    NexRoom
                </Typography>

                {/* Button to create new room */}

                <Button onClick= {createNewRoom}
                    variant ="contained"
                    fullWidth
                >
                    Create New Room
                </Button>

                <Typography>OR</Typography>
                
                {/* Input field To enter existing room ID */}
                <TextField
                    label = "Enter Room ID"
                    variant = "outlined"
                    fullWidth
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                {/* Button to join the said room */}
                <Button
                    onClick = {joinRoom}
                    variant="outlined"
                    fullWidth
                >
                    Join Room
                </Button>
            </Box>
        </Container>
    );
};

export default HomePage;