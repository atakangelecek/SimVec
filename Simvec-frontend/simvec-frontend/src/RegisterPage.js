import React, { useState } from 'react';
import './RegisterPage.css'; // Make sure to create a corresponding CSS file
import logo from './simvec.png';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to navigate to different routes
  const [errors, setErrors] = useState('');

  //password - one big one small letter at least 12 characters.

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare the user data
    const userData = {
        userName: name, // Value from a state variable or form input
        email: email,  // Value from a state variable or form input
        password: password, // Value from a state variable or form input
    };

    try {
        // Sending the request to the backend
        const response = await fetch('http://localhost:8080/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            // If the server response is not OK, handle errors
            const errorData = await response.json();
            setErrors(errorData);
            console.error("Registration failed:", errorData);
            // Here you can set error messages to display to the user
        } else {
            // Handle success scenario (e.g., navigating to a login page or showing a success message)
            console.log("Registration successful!");
            setErrors('');
            navigate('/main-page');
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
};


  return (
    <>
    <div className='header'>
        <img src={logo} alt="Logo" className="website-logo" />
      </div>
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-heading">Register</h2>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="error">{errors.password}</div> 

        <button type="submit" className="register-btn">Register</button>
      </form>
    </div>
    </>
  );
}

export default RegisterPage;
