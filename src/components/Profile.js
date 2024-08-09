import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      const fetchUser = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      };
      fetchUser();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
      <div>
        <h1>Profile</h1>
        <p>Email: {user.email}</p>
      </div>
    );
  };

  export default Profile;