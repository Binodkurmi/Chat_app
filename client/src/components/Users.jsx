// Users.jsx
import React from 'react';

const Users = ({ users }) => {
  return (
    <div className="w-64 p-4 overflow-y-auto bg-gray-100 border-r border-gray-200">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Online Users ({users.length})
      </h3>
      <ul className="space-y-2">
        {users.map((user, i) => (
          <li key={i} className="px-3 py-2 text-sm text-gray-700 bg-white rounded-md shadow-sm">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;