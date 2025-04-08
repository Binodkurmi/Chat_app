
// Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ room }) => {
  const navigate = useNavigate();

  const leaveRoom = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-green-600 text-white">
      <div className="text-xl font-semibold">Room: {room}</div>
      <button
        onClick={leaveRoom}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Leave Room
      </button>
    </div>
  );
};

export default Navbar;