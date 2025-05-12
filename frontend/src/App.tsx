// src/App.tsx
import './App.css'
import MisReservas from './components/MisReservas';

function App() {
  const usuarioId = '6819475426e945b9f63cc7a0';

  return (
    <div>
      <h1>Bienvenido al sistema de reservas</h1>
      <MisReservas usuarioId={usuarioId} />
    </div>
  );
}

export default App;
