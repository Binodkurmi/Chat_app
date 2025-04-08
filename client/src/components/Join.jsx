import React from 'react';
import { useNavigate } from 'react-router-dom';

const Join = ({ name, setName, room, setRoom, socket }) => {
  const navigate = useNavigate();

  const joinRoom = (e) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) {
      alert('Please enter both name and room');
      return;
    }

    if (!socket) {
      alert('Connection error. Please refresh the page.');
      return;
    }

    socket.connect();
    socket.emit('join', { username: name, room }, (error) => {
      if (error) {
        alert(typeof error === 'object' ? error.message || 'Error joining room' : error);
        socket.disconnect();
        return;
      }
      navigate('/chat');
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Join Chat</h1>
        <form onSubmit={joinRoom} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="general">General</option>
            <option value="random">Random</option>
            <option value="tech">Tech</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;