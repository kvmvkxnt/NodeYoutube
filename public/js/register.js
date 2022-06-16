const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const showButton = document.getElementById('showButton');

window.localStorage.removeItem('user');

showButton.addEventListener('click', () => {
  passwordInput.type = passwordInput.type == 'password' ? 'text' : 'password';
});

registerForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();

  const formData = new FormData();

  formData.append('username', usernameInput.value.trim());
  formData.append('password', passwordInput.value.trim());
  
  if (document.querySelector('#uploadInput').files[0]) {
    formData.append('avatar', document.querySelector('#uploadInput').files[0]);
  };

  const response = await fetch('/register', {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (data.status != 201) {
    errorMessage.textContent = data.message;
  } else {
    window.localStorage.setItem('user', JSON.stringify(data.data));
    window.location.replace('/');
  }
})
