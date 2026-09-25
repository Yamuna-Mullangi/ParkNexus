import React from 'react';
import Navbar from '../../components/navigation/Navbar';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="page-wrapper">
      <main className="auth-page">
        <LoginForm />
      </main>
    </div>
  );
};

export default LoginPage;
