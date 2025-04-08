import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Messages from './Messages';
import Users from './Users';
import Navbar from './Navbar';

const Chat = ({ name, room, socket, users, setUsers }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (msg) => setMessages(msgs => [...msgs, msg]);
    const roomDataHandler = ({ users }) => setUsers(users);
    const typingHandler = ({ user, isTyping }) => {
      setTypingUsers(current => 
        isTyping 
          ? [...current.filter(u => u !== user), user] 
          : current.filter(u => u !== user)
      );
    };

    socket.on('message', messageHandler);
    socket.on('roomData', roomDataHandler);
    socket.on('typing', typingHandler);

    return () => {
      socket.off('message', messageHandler);
      socket.off('roomData', roomDataHandler);
      socket.off('typing', typingHandler);
    };
  }, [socket, setUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    socket.emit('sendMessage', message, (error) => {
      if (error) {
        alert(typeof error === 'object' ? error.message || 'Error sending message' : error);
        return;
      }
      setMessage('');
    });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socket) {
      socket.emit('typing', e.target.value.length > 0);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar room={room} />
      <div className="flex flex-1 overflow-hidden">
        <Users users={users} />
        <div className="flex flex-col flex-1">
          <Messages messages={messages} name={name} messagesEndRef={messagesEndRef} />
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-sm italic text-gray-500 bg-gray-100">
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </div>
          )}
          <form onSubmit={sendMessage} className="flex p-4 bg-white border-t border-gray-200">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onBlur={() => socket?.emit('typing', false)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;