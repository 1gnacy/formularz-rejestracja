// Rejestracja
const form = document.getElementById('registerForm');
const errorEl = document.getElementById('error');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  errorEl.textContent = '';

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (username.length < 3) {
    errorEl.textContent = 'Nazwa użytkownika musi mieć co najmniej 3 znaki.';
    return;
  }

  if (!emailRegex.test(email)) {
    errorEl.textContent = 'Nieprawidłowy adres e-mail.';
    return;
  }

  if (!passwordRegex.test(password)) {
    errorEl.textContent = 'Hasło musi mieć min. 8 znaków, zawierać literę, cyfrę i znak specjalny.';
    return;
  }

  if (password !== confirmPassword) {
    errorEl.textContent = 'Hasła nie są takie same.';
    return;
  }

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password, confirmPassword }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        errorEl.textContent = data.error;
      } else {
        alert(data.message);
        form.reset();
      }
    })
    .catch(() => {
      errorEl.textContent = 'Błąd połączenia z serwerem.';
    });
});

// Logowanie
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.error || 'Błąd logowania.';
      loginMessage.style.color = 'red';
    } else {
      loginMessage.textContent = data.message + ' Witaj, ' + data.user.username + '!';
      loginMessage.style.color = 'green';
      loginForm.reset();
    }
  } catch (err) {
    loginMessage.textContent = 'Błąd połączenia z serwerem.';
    loginMessage.style.color = 'red';
  }
});