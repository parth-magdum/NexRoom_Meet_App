import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Divider} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import socket from '../socket';

interface Message{
    author: string;
    text: string;
}

//define props to accept the roomId
interface ChatSidebarProps {
    roomId?: string;
}


// //dummy messages
// const initialMessages: Message[] = [
//     { author: 'Alex', text: 'Hey everyone, welcome!'},
//     { author: 'Ben', text: 'Shut up Alex'},
// ];

const ChatSidebar: React.FC<ChatSidebarProps> = ({ roomId }) => {
    //useState to manage list of messages and we will start with empty array of messages
    const [messages, setMessages] = useState<Message[]>([]);

    //useState to manage current text in input field
    const [newMessage, setNewMessage] = useState('');

    //Listen for incoming messages from server
    useEffect(() => {
        const handleReceiveMessage = (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on('receive-message', handleReceiveMessage);

        //Remove listener when component unmounts
        return () => {
            socket.off('receive-message', handleReceiveMessage);
        };
    }, []);  // empty array makes this effect run only once

    const handleSendMessage = () => {
        if(newMessage.trim() === '' || !roomId) return;

    //create a new message object, for now author is 'You'
    const message: Message = {
        author: 'Someone', //later this will be user's name
        text: newMessage,
    };

    //Add message to our own screen immediately
    setMessages((prevMessages) => [...prevMessages, {...message, author: 'You'}]);
    
    //Emit the message to server
    socket.emit('send-message', {...message, roomId});

    //clear input field
    setNewMessage('');
    };

    return (
        <Box sx = {{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
        }}>

            {/* Chat header */}
            <Box sx = {{p:2}}>
                <Typography variant = "h6">Meeting Room Chat</Typography>
            </Box>
            <Divider sx = {{backgroundColor: '#3c4043'}} />
            
            {/* Message display area */}
            <Box
            sx={{
            flexGrow: 1, // This makes the message area take up all available space
            p: 2,
            overflowY: 'auto', // Adds a scrollbar if messages overflow
            }}>
                {messages.map((msg, index) => (
                    <Box key = {index} sx = {{mb:2}}>
                        <Typography>
                            {msg.author}
                        </Typography>
                        <Typography variant = "body2" sx = {{ wordWrap: 'break-word'}}>
                            {msg.text}
                        </Typography>
                    </Box>
                ))}
            </Box>
            
            {/* Message input area */}
            <Box sx = {{
                p:2,
                display:'flex',
                alignItems: 'center',
                backgroundColor: '#202124'
            }}>
                <TextField 
                    variant = "outlined"
                    fullWidth
                    size="small"
                    placeholder="Type a Message ..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    //Send Message on Enter
                    onKeyDown= {(e) => e.key === 'Enter' && handleSendMessage()}

                    sx = {{
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#5f6368'},
                            '&:hover fieldset': { borderColor: '#9aa0a6'},
                        },
                    }}
                />
                <IconButton onClick = {handleSendMessage} sx = {{ color: '#8ab4f8', ml: 1 }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatSidebar;