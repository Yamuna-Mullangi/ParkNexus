import React from 'react';
import Navbar from '../../components/navigation/Navbar';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="page-wrapper">
      <main className="auth-page" style={{ paddingTop: '120px', paddingBottom: '40px' }}>
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;
