import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import { ReservasAdmin } from './components/AdminReservas';

const App = () => {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ backgroundColor: '#282c34', padding: '1rem', color: 'white' }}>
          <h1 style={{ margin: 0 }}>Padel UCENIN</h1>
        </header>
        
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reservas/admin" element={<ReservasAdmin />} />
            <Route path="/" element={<h2>Bienvenido a Padel UCENIN</h2>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;