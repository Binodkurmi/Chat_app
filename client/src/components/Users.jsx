const Users = ({ users, currentUser }) => {
  return (
    <div className="users-list">
      <h3>Online Users ({users.length})</h3>
      <ul>
        {users.map((user) => (
          <li 
            key={user.id} 
            className={user.username === currentUser ? 'current-user' : ''}
          >
            {user.username} {user.username === currentUser && '(You)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;