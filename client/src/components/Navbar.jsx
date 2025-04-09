import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ room }) => {
  const navigate = useNavigate();

  const leaveRoom = () => {
    navigate('/');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-green-600 text-white shadow-md">
      <h1 className="text-lg md:text-xl font-bold">Room: {room}</h1>
      <button
        onClick={leaveRoom}
        className="px-4 py-2 text-sm font-medium bg-red-500 rounded-lg hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
      >
        Leave Room
      </button>
    </header>
  );
};

export default Navbar;
