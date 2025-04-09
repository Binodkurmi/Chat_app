import { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import Message from './Message';
import Users from './Users';

const Chat = ({ socket, username, room }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messageHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const roomDataHandler = ({ users }) => {
      setUsers(users);
    };

    const userJoinedHandler = (data) => {
      setMessages((prev) => [...prev, {
        username: 'System',
        text: `${data.username} joined the room`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    };

    const userLeftHandler = (data) => {
      setMessages((prev) => [...prev, {
        username: 'System',
        text: `${data.username} left the room`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    };

    const typingHandler = (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, data.username])]);
      } else {
        setTypingUsers((prev) => prev.filter(user => user !== data.username));
      }
    };

    socket.on('message', messageHandler);
    socket.on('roomData', roomDataHandler);
    socket.on('userJoined', userJoinedHandler);
    socket.on('userLeft', userLeftHandler);
    socket.on('typing', typingHandler);

    return () => {
      socket.off('message', messageHandler);
      socket.off('roomData', roomDataHandler);
      socket.off('userJoined', userJoinedHandler);
      socket.off('userLeft', userLeftHandler);
      socket.off('typing', typingHandler);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setError('');
    
    socket.emit('sendMessage', { message, room }, (response) => {
      if (response.success) {
        setMessage('');
        socket.emit('typing', { isTyping: false, room });
      } else {
        setError(response.message);
      }
    });
  };

  const handleTyping = () => {
    socket.emit('typing', { isTyping: !!message, room });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Room: {room}</h2>
        <Users users={users} currentUser={username} />
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            message={msg} 
            isCurrentUser={msg.username === username} 
            isSystem={msg.isSystem}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!message.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default Chat;