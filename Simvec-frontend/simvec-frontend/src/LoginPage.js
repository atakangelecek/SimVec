import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from './simvec.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to navigate to different routes

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement your login logic here, for example, verifying the credentials
    console.log('Logging in with:', username, password);

    // If login is successful, navigate to the main page
    navigate('/main-page');
  };

  const handleRegisterClick = (event) => {
    event.preventDefault(); // Prevent form submission
    navigate('/register-page'); // Navigate to register page
  };

  return (
    <>
      <div className='header'>
        <img src={logo} alt="Logo" className="website-logo" />
      </div>
      
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h2 className="login-text">Login</h2>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          <button onClick={handleRegisterClick}>Register</button>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
