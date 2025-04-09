const Join = ({ username, setUsername, room, setRoom, handleJoin, error }) => {
  return (
    <div className="join-form">
      <h2>Join Chat</h2>
      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Room</label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default Join;