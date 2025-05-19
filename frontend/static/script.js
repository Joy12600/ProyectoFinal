import express from 'express';
import { Client } from 'pg';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

function getClient() {
    return new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });
}

// Registro
app.post('/api/registrar', async (req, res) => {
    const { usuario, contraseña } = req.body;
    const client = getClient();
    await client.connect();

    try {
        const result = await client.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        if (result.rows.length > 0) {
            return res.json({ success: false, message: 'Usuario ya existe' });
        }

        const hash = await bcrypt.hash(contraseña, 10);
        await client.query('INSERT INTO usuarios (usuario, contraseña) VALUES ($1, $2)', [usuario, hash]);
        res.json({ success: true, message: 'Usuario registrado' });
    } catch (err) {
        res.json({ success: false, message: 'Error: ' + err.message });
    } finally {
        await client.end();
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { usuario, contraseña } = req.body;
    const client = getClient();
    await client.connect();

    try {
        const result = await client.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        if (result.rows.length === 0) return res.json({ success: false });

        const valid = await bcrypt.compare(contraseña, result.rows[0].contraseña);
        res.json({ success: valid });
    } catch (err) {
        res.json({ success: false, message: 'Error: ' + err.message });
    } finally {
        await client.end();
    }
});

// Crear usuario en PostgreSQL (opcional)
app.post('/api/registrar_db_user', async (req, res) => {
    const { usuario, contraseña } = req.body;
    const client = getClient();
    await client.connect();

    try {
        const createQuery = `CREATE ROLE "${usuario}" WITH LOGIN PASSWORD '${contraseña}' NOSUPERUSER NOCREATEDB NOCREATEROLE;`;
        await client.query(createQuery);
        res.json({ success: true, message: 'Usuario de PostgreSQL creado' });
    } catch (err) {
        res.json({ success: false, message: 'Error: ' + err.message });
    } finally {
        await client.end();
    }
});

app.listen(3000, () => console.log('Servidor backend en http://localhost:3000'));
