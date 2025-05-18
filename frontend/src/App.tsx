// frontend/src/App.tsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MisReservas from './components/MisReservas';
import AdminReservas from './components/AdminReservas';
import Canchas from './components/Canchas';
import OpcionesAdmin from './components/OpcionesAdmin';

//----------------------------
import Registro from './components/Registro';
//------------------------

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/registro" element={<Registro />} />

          <Route path="/login" element={<Login />} />
          <Route path="/mis-reservas" element={<MisReservas />} />

          <Route path="/admin" element={<OpcionesAdmin />} />
          <Route path="/admin/reservas" element={<AdminReservas />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/admin/canchas" element={<Canchas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;