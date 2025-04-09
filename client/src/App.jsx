import { useState } from 'react';
import { io } from 'socket.io-client';
import Chat from './components/Chat';
import Join from './components/Join';
import './App.css';

// Create socket connection
const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false
});

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !room.trim()) {
      setError('Username and room are required');
      return;
    }

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join', { username: username.trim(), room: room.trim() }, (response) => {
      if (response.success) {
        setJoined(true);
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div className="app">
      {!joined ? (
        <Join
          username={username}
          setUsername={setUsername}
          room={room}
          setRoom={setRoom}
          handleJoin={handleJoin}
          error={error}
        />
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;