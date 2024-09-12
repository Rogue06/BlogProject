import React, { useState } from 'react';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      <h1>Mon Blog</h1>
      {isLogin ? <LoginForm /> : <SignUpForm />}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "S'inscrire" : "Se connecter"}
      </button>
    </div>
  );
}

export default App;