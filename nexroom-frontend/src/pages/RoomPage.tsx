import React, {useEffect, useRef, useState} from "react";
import {useParams} from 'react-router-dom';
import {Box} from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import ControlsBar from '../components/ControlsBar';
import ChatSidebar from '../components/ChatSidebar';
import socket from '../socket';
import { Audiotrack } from "@mui/icons-material";

const RoomPage = () => {
    const {roomId} = useParams<{roomId: string}>();//get roomId from URL

    //State to hold our own video stream
    const [myStream, setMyStream] = useState<MediaStream | null>(null);

    //State to hold remote streams, mapping peer ID to their streams
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

    //A ref to store all peer connections, mapping peer ID to RTCPeerConnection
    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

    // ---State for mic/camera status ---
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    //Request access to camera and microphone to user's own media stream
    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                console.log("Stream acquired:", stream); //for debugging
                setMyStream(stream);
            } catch (err) {
                console.log('Error accessing media devices', err);
            }
        };
        getMedia();
    }, []); //Runs only once of component mount

    //Main useEffect for handling all socket and WebRTC Logic
    useEffect(() => {
        if (!myStream || !roomId) return;

        console.log("Setting up WebRTC for stream:", myStream.id);
        socket.emit('join-room', roomId);

        // Helper function to create a new peer connection
        const createPeerConnection = (peerId: string, isInitiator: boolean) => {
            console.log(`Creating peer connection for ${peerId}, initiator: ${isInitiator}`);
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnections.current[peerId] = peerConnection;

            // Add our local stream tracks so the other peer can see us
            myStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, myStream);
            });

            // When the remote peer's stream arrives, add it to the state
            peerConnection.ontrack = (event) => {
                console.log(`Received remote track from ${peerId}`);
                setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
            };

            // Send ICE candidates to the other peer
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { target: peerId, candidate: event.candidate });
                }
            };

            return peerConnection;
        };

        // --- Event Listeners ---

        // For the user who is ALREADY in the room (the initiator)
        socket.on('user-joined', async ({ peerId }) => {
            console.log(`%c[CLIENT] "user-joined" event received for new peer: ${peerId}`, "color: lightgreen; font-weight: bold;");

            const peerConnection = createPeerConnection(peerId, true);
            
            // Create and send an offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { target: peerId, sdp: offer, callerId: socket.id });
        });

        // For the user who has JUST JOINED the room (the receiver)
        socket.on('offer', async (payload) => {
            const { callerId, sdp } = payload;
            const peerConnection = createPeerConnection(callerId, false);

            await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { target: callerId, sdp: answer, callerId: socket.id });
        });

        socket.on('answer', async (payload) => {
            const { callerId, sdp } = payload;
            const peerConnection = peerConnections.current[callerId];
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        });

        socket.on('ice-candidate', async (payload) => {
            const { senderId, candidate } = payload;
            const peerConnection = peerConnections.current[senderId];
            if (peerConnection && candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        // Cleanup logic
        return () => {
            console.log("Cleaning up all listeners and connections.");
            socket.off('user-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [myStream, roomId]); //This effect runs whenever myStream or roomId changes

    //Functions to toggle mic and camera
    const toggleMic = () => {
        if(myStream){
            const audioTrack = myStream.getAudioTracks()[0];
            if(audioTrack){
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleCamera = () => {
        if(myStream) {
            const videoTrack = myStream?.getVideoTracks()[0];
            if(videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    return (
        <Box sx = {{ display: 'flex',
                     height: '100vh',
                     backgroundColor: '#202124'
        }}>
            {/* Main content area */}
            <Box sx = {{ flexGrow: 1,
                         display: 'flex',
                         flexDirection: 'column'
            }}>
                {/* VideoGrid takes up most of the space */}
                <Box sx = {{ flexGrow: 1}}>
                    {/* Pass stream to VideoGrid */}
                    <VideoGrid myStream = {myStream} remoteStreams = {remoteStreams}/>
                </Box>

                {/* Controls bar at the bottom */}
                <Box>
                    <ControlsBar 
                        isMicOn = {isMicOn}
                        isCameraOn = {isCameraOn}
                        toggleMic = {toggleMic}
                        toggleCamera = {toggleCamera}
                    />
                </Box>
            </Box>
            
            {/* Chat sidebar on the right */}
            <Box sx = {{
                width: '350 px',
                borderLeft: '1px solid #3c4043',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#242528',
            }}>
                <ChatSidebar roomId = {roomId} />
            </Box>

        </Box>
    );
};

export default RoomPage;