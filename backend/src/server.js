const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/registroUsuarios', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Esquema de Usuario
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
}));

// Ruta para el registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Faltan datos' });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Usuario ya existe' });

    const user = new User({ username, password }); // ⚠ En producción, hashea la contraseña
    await user.save();

    res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Iniciar el servidor
app.listen(3001, () => console.log('Servidor en http://localhost:3001'));