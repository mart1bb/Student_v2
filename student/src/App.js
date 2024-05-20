import React, { useState } from "react";
import Login from "./components/LoginPage.js"; // Import the Login component
import Profil from "./components/Profil.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* ... other content */}
      </header>
      {!isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
      {isLoggedIn && <Profil />}
    </div>
  );
}

export default App;
