// Configuración básica de servidor Node.js con Express y conexión a MySQL2
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configura aquí tus credenciales de MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia por tu contraseña
    database: 'usuarios_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Registro de usuario
app.post('/api/registrar', (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        if (results.length > 0) {
            return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
        }
        db.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)', [nombre, correo, contrasena], (err) => {
            if (err) return res.status(500).json({ error: 'Error al registrar usuario' });
            res.json({ mensaje: 'Usuario registrado correctamente' });
        });
    });
});

// Inicio de sesión
app.post('/api/login', (req, res) => {
    const { correo, contrasena } = req.body;
    db.query('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario: results[0] });
    });
});

// CRUD para el carrito (backend)
// Obtener carrito
app.get('/api/carrito', (req, res) => {
    db.query('SELECT * FROM carrito', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        res.json(results);
    });
});
// Agregar bebida al carrito
app.post('/api/carrito', (req, res) => {
    const { nombre } = req.body;
    db.query('INSERT INTO carrito (nombre) VALUES (?)', [nombre], (err) => {
        if (err) return res.status(500).json({ error: 'Error al agregar al carrito' });
        res.json({ mensaje: 'Bebida agregada al carrito' });
    });
});
// Eliminar bebida del carrito
app.delete('/api/carrito/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM carrito WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar del carrito' });
        res.json({ mensaje: 'Bebida eliminada del carrito' });
    });
});
// Vaciar carrito
app.delete('/api/carrito', (req, res) => {
    db.query('DELETE FROM carrito', (err) => {
        if (err) return res.status(500).json({ error: 'Error al vaciar el carrito' });
        res.json({ mensaje: 'Carrito vaciado' });
    });
});

app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
