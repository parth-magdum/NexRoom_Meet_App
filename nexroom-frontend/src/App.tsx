import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'
import socket from './socket';

function App() {
  //useEffect hook to manage connection
  useEffect(() => {
    //listen for the 'connect' event
    socket.on('connect', () => {
       console.log('Connected to server with socket ID: ', socket.id);
    });

    //clean up connection when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []); //empty array ensures it only runs once

  return (
    <Routes>
      {/* This route is for home page */}
      <Route path="/" element={<HomePage />} />

      {/* This route for video call room, ':roomId' is a unique room ID */}
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
}

export default App;
