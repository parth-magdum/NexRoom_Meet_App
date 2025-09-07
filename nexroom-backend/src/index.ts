import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

//Configure CORS to allow the react frontend to connect
const io = new Server(server, {
    cors: {
        //Temporary ngrok forwarding for testing
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

//Core of real time functionality
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    //Event: A user joins a specific room
    socket.on('join-room', (roomId: string) => {
    console.log(`[Server] User ${socket.id} is joining room ${roomId}`); // <-- ADD THIS
    socket.join(roomId);
    
    // Announce to others in the room that a new user has joined
    console.log(`[Server] Emitting 'user-joined' to room ${roomId}`); // <-- ADD THIS
    socket.to(roomId).emit('user-joined', { peerId: socket.id });
});

    // --- WebRTC Signaling Events---

    //Relaying the offer to a specific peer
    socket.on('offer', (payload) => {
        io.to(payload.target).emit('offer', payload);
    });

    //Relaying the answer back to the originator
    socket.on('answer', (payload) => {
        io.to(payload.target).emit('answer', payload);
    });

    //Relaying ICE Candidates
    socket.on('ice-candidates', (payload) => {
        io.to(payload.target).emit('ice-candidates', {...payload, senderId: socket.id});
    });

    //Event: A user sends a message to a room
    socket.on('send-message', (data: {text: string; roomId:string; author:string}) => {
        //broadcast message to the same room
        socket.to(data.roomId).emit('receive-message', data);
    });

    

    //handle user disconnection
    socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});