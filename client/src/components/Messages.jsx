import React from 'react';
import Message from './Message';

const Messages = ({ messages, name, messagesEndRef }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg, i) => (
        <Message key={i} message={msg} name={name} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
