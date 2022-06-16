const users_list = document.querySelector('.navbar-list');
const videos_list = document.querySelector('.iframes-list');
const videoTemplate = document.getElementById('video-template').content;
const datalist = document.getElementById('datalist');
const form = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-input');
const user_avatar = document.getElementById('user_avatar');
const admin_button = document.getElementById('admin-button');

function renderUsers(arr) {
  const usersFragmet = document.createDocumentFragment();
  users_list.innerHTML = null;

  const defaultFragment = document.createDocumentFragment();
  const defaultLi = document.createElement('li');
  const defaultA = document.createElement('a');
  const defaultImg = document.createElement('svg');
  const defaultSpan = document.createElement('span');
  const defaultTitle = document.createElement('h1');

  defaultSpan.textContent = 'Home';
  defaultImg.setAttribute('viewbox', '0 0 24 24');
  defaultImg.setAttribute('focusable', 'false');
  defaultImg.setAttribute('style', "pointer-events: none; display: block; width: 30px; height: 30px;")
  defaultImg.innerHTML = '<g><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8" class="style-scope yt-icon"></path></g>';
  defaultA.href = '/videos';
  defaultLi.className = 'channel active';
  defaultLi.dataset.id = 'main';
  defaultTitle.textContent = 'YouTube Members';

  defaultA.appendChild(defaultImg);
  defaultA.appendChild(defaultSpan);
  defaultLi.appendChild(defaultA);

  defaultFragment.appendChild(defaultTitle);
  defaultFragment.appendChild(defaultLi);
  usersFragmet.appendChild(defaultFragment);

  arr.forEach(user => {

    if (window.localStorage.getItem('user')) {
      if (user.userId === JSON.parse(window.localStorage.getItem('user')).userId) {
        user_avatar.querySelector('img').src = user.avatar;
        return;
      }
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    const img = document.createElement('img');
    const span = document.createElement('span');

    span.textContent = user.username;
    img.src = `/${user.avatar}`;
    img.alt = 'channel-icon';
    img.width = 30;
    img.height = 30;
    a.href = `/videos?userId=${user.userId}`;
    li.className = 'channel';
    li.dataset.id = user.userId;

    a.appendChild(img);
    a.appendChild(span);
    li.appendChild(a);
    usersFragmet.appendChild(li);
  });

  users_list.appendChild(usersFragmet);
}

function renderVideos(arr) {
  videos_list.innerHTML = null;

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
    videos_list.appendChild(newVideo);
  });
}

function renderOptions(arr) {
  datalist.innerHTML = null;
  arr.forEach(title => {
    const newOption = document.createElement('option');
    newOption.value = title;
    datalist.appendChild(newOption);
  });
};

async function getUsers() {
  const response = await fetch('/users');
  const data = await response.json();
  renderUsers(data.data);
}

async function getVideos(search) {
  const response = await fetch(search ? search : '/videos');
  const data = await response.json();
  renderVideos(data.data);
  const titles = data.data.map(video => video.title);
  renderOptions(titles);
}

getUsers();
getVideos();

function searchGenerator() {
  const searchQuery = searchInput.value.trim().split(' ').join('+');
  const link = users_list.querySelector('.active').querySelector('a').href;
  
  if (!searchQuery) {
    getVideos(link);
    return;
  } else if (!link.includes('?')) {
    getVideos(`${link}?query=${searchQuery}`);
    return;
  }
  getVideos(`${link}&query=${searchQuery}`);
}

users_list.addEventListener('click', (evt) => {
  evt.preventDefault();

  const tar = evt.target;

  if (tar.matches('a')) {
    const prevActive = users_list.querySelector('.active');
    if (prevActive) {
      prevActive.classList.remove('active');
    }
    tar.parentNode.classList.add('active');
    searchGenerator();
  } else if (tar.matches('span') || tar.matches('img') || tar.mathces('svg')) {
    const prevActive = users_list.querySelector('.active');
    if (prevActive) {
      prevActive.classList.remove('active');
    }
    tar.parentNode.parentNode.classList.add('active');
    searchGenerator();
  }
});

form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  searchGenerator();
});

admin_button.addEventListener('click', () => {
  window.location.replace('/admin');
});
