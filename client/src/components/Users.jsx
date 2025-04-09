const Users = ({ users, currentUser }) => {
  return (
    <div
      style={{
        backgroundColor: '#f4f4f4',
        padding: '1rem',
        borderRadius: '8px',
        maxWidth: '250px',
        marginBottom: '1rem'
      }}
    >
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        Online Users ({users.length})
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              padding: '0.3rem 0',
              borderBottom: '1px solid #ddd',
              fontWeight: user.username === currentUser ? 'bold' : 'normal',
              color: user.username === currentUser ? '#007bff' : '#333'
            }}
          >
            {user.username} {user.username === currentUser && '(You)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
