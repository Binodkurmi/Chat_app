import React from 'react';

const Message = ({ message, name }) => {
  const isNotification = message.type === 'join' || message.type === 'leave';
  const isSentByCurrentUser = message.user === name;

  if (isNotification) {
    return (
      <div className="p-2 my-1 text-sm text-center text-gray-600 bg-gray-100 rounded">
        {message.user} has {message.type === 'join' ? 'joined' : 'left'} the chat
      </div>
    );
  }

  return (
    <div className={`flex my-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
        isSentByCurrentUser ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
      }`}>
        {!isSentByCurrentUser && (
          <div className="font-bold text-sm">{message.user}</div>
        )}
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 text-right ${
          isSentByCurrentUser ? 'text-green-100' : 'text-gray-500'
        }`}>
          {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Message;