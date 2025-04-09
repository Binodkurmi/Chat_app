import { format } from 'date-fns';

const Message = ({ message, isCurrentUser, isSystem }) => {
  return (
    <div className={`message ${isCurrentUser ? 'current-user' : ''} ${isSystem ? 'system-message' : ''}`}>
      {!isSystem && (
        <div className="message-header">
          <span className="username">{message.username}</span>
          <span className="timestamp">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        </div>
      )}
      <div className="message-text">{message.text}</div>
    </div>
  );
};

export default Message;