const errorMessage = document.getElementById('errorMessage');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const showButton = document.getElementById('showButton');
const loginForm = document.getElementById('loginForm');

window.localStorage.removeItem('user');

showButton.addEventListener('click', () => {
  passwordInput.type = passwordInput.type == 'password' ? 'text' : 'password';
});

loginForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();

  const response = await fetch('/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim()
    })
  });

  const data = await response.json();

  console.log(data)

  if (data.status != 200) {
    errorMessage.textContent = data.message;
  } else {
    window.localStorage.setItem('user', JSON.stringify(data.data));
    window.location.replace('/');
  }
})
