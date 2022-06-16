const videosList = document.getElementById('videosList');
const videoTemplate = document.getElementById('video-template').content;
const logoutBtn = document.getElementById('logoutBtn');
const videoForm = document.getElementById('videoForm');
const videoInput = document.getElementById('videoInput');
const errorMessage = document.getElementById('errorMessage');
const editForm = document.getElementById('video-form');
const editInput = document.getElementById('video-input');

logoutBtn.addEventListener('click', () => {
  window.localStorage.removeItem('user');
  document.cookie = `token=;`;
  window.location.replace('/');
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function renderVideos(arr) {
  videosList.innerHTML = null;

  arr.forEach(video => {
    const newVideo = videoTemplate.cloneNode(true);
    const videoDateTime = video.date.split('T');
    const videoDate = videoDateTime[0].split('-').join(' / ');
    const videoTime = videoDateTime[1].split('.')[0];
    newVideo.querySelector('video').src = `/${video.link}`;
    newVideo.querySelector('img').src = `/${video.user.avatar}`;
    newVideo.querySelector('.channel-name').textContent = video.user.username;
    newVideo.querySelector('.iframe-title').textContent = video.title;
    newVideo.querySelector('.uploaded-time').textContent = `${videoDate} ${videoTime}`;
    newVideo.querySelector('.download').href = `/download/${video.link}`;
    newVideo.querySelector('span').textContent = `${Math.ceil(video.size / 1024 / 1024)} MB`;
    newVideo.querySelector('.delete').dataset.id = video.videoId;
    newVideo.querySelector('#video-form').dataset.id = video.videoId;
    videosList.appendChild(newVideo);
  });
}

async function getVideos() {
  const response = await fetch('/admin/videos', {
    method: "GET",
    headers: {
      'token': getCookie('token'),
    }
  });
  const data = await response.json();
  renderVideos(data.data);
}

getVideos();

videoForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();

  const videoTitle = videoInput.value.trim();
  const videoFile = document.getElementById('uploadInput').files[0];
  let formData = new FormData();

  formData.append('title', videoTitle);
  formData.append('video', videoFile);

  const response = await fetch('/admin/videos', {
    method: "POST",
    headers: {
      'token': getCookie('token'),
    },
    body: formData,
  });

  const data = await response.json();

  if (data.message != 'ok') {
    errorMessage.textContent = data.message;
  } else {
    videoInput.value = null;
    getVideos();
  }
});

videosList.addEventListener('click', async (evt) => {
  const tar = evt.target;

  if (tar.matches('.delete')) {
    const videoId = Number(tar.dataset.id);
    const response = await fetch(`/admin/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        'token': getCookie('token')
      }
    });
    const data = await response.json();

    if (data.message != 'ok') {
      errorMessage.textContent = data.message;
    }

    getVideos();
  }
})

videosList.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const tar = evt.target;

  if (tar.matches('#video-form')) {
    const newTitle = tar.querySelector('#video-input').value.trim();
    const response = await fetch(`/admin/videos/${tar.dataset.id}`, {
      method: "PUT",
      headers: {
        'content-type': 'application/json',
        'token': getCookie('token'),
      },
      body: JSON.stringify({
        title: newTitle
      })
    });
    const data = await response.json();
    
    if (data.message != 'ok') {
      errorMessage.textContent = data.message;
    }
    getVideos();
  }
});
