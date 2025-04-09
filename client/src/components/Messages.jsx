import React from 'react';
import Message from './Message';

const Messages = ({ messages, name, messagesEndRef }) => {
  return (
    <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2">
      {messages.map((msg, i) => (
        <Message key={i} message={msg} name={name} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
