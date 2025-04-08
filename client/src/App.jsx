import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import Join from './components/Join';
import Chat from './components/Chat';
import './App.css'

function App() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('general');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      autoConnect: false
    });
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Join
              name={name}
              setName={setName}
              room={room}
              setRoom={setRoom}
              socket={socket}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <Chat
              name={name}
              room={room}
              socket={socket}
              users={users}
              setUsers={setUsers}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;