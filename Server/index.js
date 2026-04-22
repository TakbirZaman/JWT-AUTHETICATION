const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envFile = fs.readFileSync(envPath, 'utf-8');

  envFile.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'development_secret_key';

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const users = [];

const createToken = (email) => {
  return jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });
};

const sanitizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  const token = authorization.split(' ')[1];

  jwt.verify(token, jwtSecret, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }

    req.decoded = decoded;
    next();
  });
};

app.get('/', (req, res) => {
  res.send({ message: 'JWT authentication server is running' });
});

app.post('/jwt', (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).send({ message: 'Email is required' });
  }

  const token = createToken(email);
  res.send({ token });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).send({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).send({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return res.status(409).send({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = createToken(newUser.email);

    res.status(201).send({
      message: 'Registration successful',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    res.status(500).send({ message: 'Failed to register user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required' });
    }

    const existingUser = users.find((user) => user.email === email);

    if (!existingUser) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const passwordMatched = await bcrypt.compare(password, existingUser.passwordHash);

    if (!passwordMatched) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const token = createToken(existingUser.email);

    res.send({
      message: 'Login successful',
      token,
      user: sanitizeUser(existingUser),
    });
  } catch (error) {
    res.status(500).send({ message: 'Failed to login' });
  }
});

app.get('/profile', verifyToken, (req, res) => {
  const existingUser = users.find((user) => user.email === req.decoded.email);

  if (!existingUser) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.send({
    message: 'Protected profile data fetched successfully',
    user: sanitizeUser(existingUser),
  });
});

app.listen(port, () => {
  console.log(`JWT authentication server is running on port ${port}`);
});
