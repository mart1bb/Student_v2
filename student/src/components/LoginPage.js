import React, { useState, useEffect } from "react";
import styles from '../css/LoginPage.css';

function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);

    // Function to send the local token
    const sendToken = async () => {
      const token = localStorage.getItem("jwtToken");
  
      if (token) {
        try {
          const response = await fetch("/api/me", {
            method: "GET",
            headers: {
              Authorization: `${token}`,
            },
          });
  
          const data = await response.json();
  
          if (response.status === 200) {
            // User is logged in, handle accordingly
            props.onLoginSuccess();
          } else {
            // Token is invalid, handle accordingly
            localStorage.removeItem("jwtToken");
            setMessage("Invalid token. Please log in again.");
          }
        } catch (error) {
          console.error(error);
          setMessage("An error occurred. Please try again later.");
        }
      }
    };
  
    // Use useEffect to send the token when the component mounts
    useEffect(() => {
      sendToken();
    }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        const token = data.token;
        localStorage.setItem("jwtToken", token);
        props.onLoginSuccess(); // Call the onLoginSuccess prop
      } else {
        setMessage("Incorrect username or password.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      console.log(response);
      const data = await response.json();
      console.log(data);
      if (data.response === "User created") {
        setMessage("User created successfully. Please log in.");
        setShowSignup(false); // Hide signup form
      } else {
        setMessage("An error occurred during registration. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-page">
      <h2>{showSignup ? "Sign Up" : "Login"}</h2>
      <form onSubmit={showSignup ? handleSignup : handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {showSignup && (
          <label htmlFor="confirmPassword">Confirm Password:</label>
        )}
        {showSignup && (
          <input
            type="password"
            id="confirmPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button type="submit">{showSignup ? "Sign Up" : "Login"}</button>
      </form>
      <p>{message}</p>
      {!showSignup && (
        <button onClick={() => setShowSignup(true)}>Sign Up</button>
      )}
      {showSignup && (
        <button onClick={() => setShowSignup(false)}>Back to Login</button>
      )}
    </div>
  );
}

export default Login;