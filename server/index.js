const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const usersFilePath = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.static(path.join(__dirname, '../public')));

// Rejestracja
app.post('/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Nazwa użytkownika musi mieć co najmniej 3 znaki.' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy adres e-mail.' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Hasło musi mieć min. 8 znaków, zawierać literę, cyfrę i znak specjalny.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Hasła nie są takie same.' });
  }

  let users = [];
  if (fs.existsSync(usersFilePath)) {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  }

  const emailExists = users.some(user => user.email === email);
  if (emailExists) {
    return res.status(400).json({ error: 'Użytkownik z tym adresem e-mail już istnieje.' });
  }

  users.push({ username, email, password });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  return res.json({ message: 'Rejestracja udana!' });
});

// Logowanie
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Wprowadź e-mail i hasło.' });
  }

  if (!fs.existsSync(usersFilePath)) {
    return res.status(400).json({ error: 'Brak zarejestrowanych użytkowników.' });
  }

  const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło.' });
  }

  return res.json({ message: 'Zalogowano pomyślnie!', user: { username: user.username, email: user.email } });
});

// Fallback dla frontendowej aplikacji SPA
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
