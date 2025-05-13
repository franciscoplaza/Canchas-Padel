// frontend/src/App.tsx
import './App.css'
import MisReservas from './components/MisReservas';

function App() {
  const usuarioId = '6819475426e945b9f63cc7a0';

  return (
    <div>
      <h1> Sistema de Reservas</h1>
      <MisReservas usuarioId={usuarioId} />
    </div>
  );
}

export default App;
