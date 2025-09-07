import {io} from 'socket.io-client';

//connect to backend server
const PORT=8080
const socket = io(`http://localhost:${PORT}`)

export default socket;