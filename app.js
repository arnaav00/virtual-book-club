// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyC4v1NXT7MPskIUU0egAnrrhtl9Fvs8808",
  authDomain: "bookworm-1c325.firebaseapp.com",
  projectId: "bookworm-1c325",
  storageBucket: "bookworm-1c325.appspot.com",
  messagingSenderId: "1014862868857",
  appId: "1:1014862868857:web:9aaf2ca46cdc5d653f3fa8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// === Globals ===
let currentUser = null;
let isAdmin = false;
let currentQuestions = [];
let currentIndex = 0;
let currentPostId = null;
let totalQuestions = 0;

// === DOM Elements ===
const postsContainer = document.getElementById('posts');
const shelveBtn = document.getElementById('shelve-btn');
const changeRoleBtn = document.getElementById('change-role');
const aboutUsBtn = document.getElementById('about-us');

const postModal = document.getElementById('post-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const questionText = document.getElementById('question-text');
const answersSection = document.getElementById('answers-section');
const modalClose = document.getElementById('modal-close');
const prevQuestion = document.getElementById('prev-question');
const nextQuestion = document.getElementById('next-question');

const createPostModal = document.getElementById('create-post-modal');
const newPostForm = document.getElementById('new-post-form');
const createPostClose = document.getElementById('create-post-close');
const cancelAdmin = document.getElementById('cancel-admin');

const entryModal = document.getElementById('entry-modal');
const entryForm = document.getElementById('entry-form');
const passInput = document.getElementById('entry-pass');
const hitchhikerBtn = document.getElementById('hitchhiker');
const introScreen = document.getElementById('intro-screen');
const openEntry = document.getElementById('open-entry');

const aboutBtn = document.getElementById('about-us');
const aboutModal = document.getElementById('about-modal');
const aboutClose = document.getElementById('about-close');

const toggleBtn = document.getElementById('toggle-music');
const bgMusic = document.getElementById('bg-music');

arnaav_secret = 'banana'
devangshi_secret = 'microwave'
let editingPostId = null;

toggleBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleBtn.textContent = '🔊'; // playing icon
  } else {
    bgMusic.pause();
    toggleBtn.textContent = '🔇'; // muted icon
  }
});


window.addEventListener('load', () => {
  document.getElementById('posts').style.display = 'none';
  document.getElementById('action-buttons').style.display = 'none';
  document.body.classList.add('intro-lock');
});

openEntry.addEventListener('click', () => {
  introScreen.style.display = 'none';
  entryModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  const music = document.getElementById('bg-music');
  if (music) music.play().catch(() => {
    // Some browsers block autoplay until another gesture
    console.log('User interaction required to start audio.');
});
});


// === Reopen modal on click of Beam Me Up ===
changeRoleBtn.addEventListener('click', () => {
  entryModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  document.querySelector('#entry-modal .modal-content').classList.add('minimized');
});

// === Load Posts ===
function loadPosts() {
  db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    postsContainer.innerHTML = '';
    cardIndex = 0; // reset for stagger animation
    snapshot.forEach(doc => renderPost(doc));
  });
}


// === Handle role selection via form ===
entryForm.addEventListener('submit', e => {
  console.log('Submitting form...');
  e.preventDefault();
  const val = passInput.value.trim();
  passInput.value = '';

  if (val === arnaav_secret) {
    currentUser = 'arnaav';
    isAdmin = true;
    shelveBtn.style.display = 'inline-block';
    toast('Glad to have you back, Cap\'n!');
  } else if (val === devangshi_secret) {
    currentUser = 'devangshi';
    isAdmin = false;
    shelveBtn.style.display = 'none';
    toast('We missed you, Devangshi!');
  } else {
    alert('Well that\'s cool and all but also like totally not your password.');
    return;
  }

  entryModal.classList.remove('show');
  document.body.style.overflow = '';
  introScreen.style.display = 'none';
  document.getElementById('posts').style.display = 'flex';
  document.getElementById('action-buttons').style.display = 'flex';
  loadPosts();
  document.querySelector('.site-title').style.display = 'flex';
  document.getElementById('starfield').style.display = 'none';
  document.body.classList.remove('intro-lock');
  document.documentElement.classList.remove('intro-lock');
  document.querySelector('.site-title').style.display = 'block';
  document.getElementById('action-buttons').style.display = 'flex';
  // loadPosts();
});

// === Hitchhiker mode ===
hitchhikerBtn.addEventListener('click', () => {
  currentUser = null;
  isAdmin = false;
  shelveBtn.style.display = 'none';
  toast("Welcome aboard, Hitchhiker!");
  entryModal.classList.remove('show');
  document.body.style.overflow = '';
  introScreen.style.display = 'none';
  document.getElementById('posts').style.display = 'flex';
  loadPosts();
  document.getElementById('action-buttons').style.display = 'flex';
  document.querySelector('.site-title').style.display = 'block';
  document.getElementById('starfield').style.display = 'none';
  document.body.classList.remove('intro-lock');
  document.documentElement.classList.remove('intro-lock');
});

// === Shelve Modal Trigger ===
shelveBtn.addEventListener('click', () => {
  createPostModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

let cardIndex = 0; 

function renderPost(doc) {
  const data = doc.data();
  const card = document.createElement('div');
  const dateStr = data.timestamp?.toDate 
  ? data.timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
  : 'Unknown';

  card.classList.add('card');

  card.innerHTML = `
    <img src="${data.imageURL}" alt="${data.title}" />
    <div class="card-body">
      <div class="card-title">${data.title}</div>
      <div class="card-author">by ${data.author}</div>
      <div class="genre-badges">
  ${data.genres.map(g => `<span>${g}</span>`).join('')}
  ${data.ratings?.arnaav > 0 ? `<span class="card-rating blue">★ ${data.ratings.arnaav}</span>` : ''}
  ${data.ratings?.devangshi > 0 ? `<span class="card-rating purple">★ ${data.ratings.devangshi}</span>` : ''}
</div>
      <div class="card-description">${data.shortDescription}</div>
      <div class="card-shelved"><strong>Shelved On:</strong> ${dateStr}</div>      
    </div>
    ${currentUser === 'arnaav' ? `
      <div class="card-tools">
        <i onclick="editPost('${doc.id}')" title="Edit">✎</i>
        <i onclick="deletePost('${doc.id}')" title="Delete">🗑</i>
      </div>` : ''}
  `;

  card.style.transitionDelay = `${cardIndex * 0}ms`; // stagger by 100ms
  cardIndex++;

  card.addEventListener('click', e => {
    if (e.target.tagName === 'I') return;
    openModal(data, doc.id);
  });

  postsContainer.appendChild(card);

  // Animate in after short delay
  setTimeout(() => {
    card.classList.add('animate-in');
  }, 50);
}

// === Book Modal Logic ===
function openModal(post, id) {
  currentPostId = id;
  currentQuestions = post.questions;
  currentRatings = post.ratings || {};
  renderRatings();
  totalQuestions = post.questions.length;
  updateQuestionNavigation();

  currentIndex = 0;

  // Set title and author
  document.getElementById('modal-title').textContent = post.title;
  document.getElementById('modal-author').textContent = `by ${post.author}`;

  // Set image and description in the new panel layout
  document.getElementById('modal-book-image').src = post.imageURL;
  document.getElementById('modal-description').textContent = post.shortDescription;

  // Show modal
  const postModal = document.getElementById('post-modal');
  postModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  renderQuestion();
}


function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = timestamp instanceof Date
    ? timestamp
    : new Date(timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);

  const diffMs = now - time;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

  return time.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function renderQuestion() {
  const q = currentQuestions[currentIndex];
  questionText.textContent = q.text;
  answersSection.innerHTML = '';

  ['arnaav', 'devangshi'].forEach(user => {
    const answer = q.answers?.[user] || {};
    const block = document.createElement('div');
    block.classList.add('answer-block');

    const isMine = currentUser === user;
    const text = answer.text || '';
    const date = answer.timestamp ? formatTimeAgo(answer.timestamp) : '';

    block.innerHTML = `
  <div class="answer-header">
    <h4>${user.charAt(0).toUpperCase() + user.slice(1)}</h4>
    <img src="${user === 'arnaav' ? 'arnaav.png' : 'devangshi.png'}" class="profile-icon" alt="${user}" />
  </div>
  <p class="answer-text">${text ? text.replace(/\n/g, '<br>') : '<i>No answer yet.</i>'}</p>
  <div class="timestamp">${date}</div>
`;


    if (isMine) {
      const original = text;

      const textEl = block.querySelector('.answer-text');
      textEl.style.cursor = 'pointer';
      textEl.addEventListener('click', () => {
        block.innerHTML = `
  <h4>${user.charAt(0).toUpperCase() + user.slice(1)}</h4>
  <div class="answer-input">
    <textarea>${original}</textarea>
    <div class="button-group">
      <button class="submit-btn">Submit</button>
      <button class="cancel-btn">Cancel</button>
    </div>
  </div>
`;


block.querySelector('.submit-btn').onclick = () => {
  const newText = block.querySelector('textarea').value.trim();
  if (!newText) return;

  db.collection('posts').doc(currentPostId).get().then(doc => {
    const postData = doc.data();
    const updatedQuestions = [...(postData.questions || [])];

    if (!updatedQuestions[currentIndex]) {
      updatedQuestions[currentIndex] = { text: '', answers: {} };
    }

    if (!updatedQuestions[currentIndex].answers) {
      updatedQuestions[currentIndex].answers = {};
    }

    updatedQuestions[currentIndex].answers[user] = {
      text: newText,
      timestamp: new Date()
    };

    db.collection('posts').doc(currentPostId).update({
      questions: updatedQuestions
    }).then(() => {
      currentQuestions = updatedQuestions;
      renderQuestion();
      toast("Logged on today's stardate!");
    });
  });
};


        block.querySelector('.cancel-btn').onclick = () => renderQuestion();
      });
    }

    answersSection.appendChild(block);
  });

  prevQuestion.classList.toggle('hidden', currentIndex === 0);
  nextQuestion.classList.toggle('hidden', currentIndex === currentQuestions.length - 1);
}

// === Modal Controls ===
modalClose.onclick = () => closeModal(postModal);
createPostClose.onclick = () => closeModal(createPostModal);
cancelAdmin.onclick = () => closeModal(createPostModal);

postModal.addEventListener('click', e => { if (e.target === postModal) closeModal(postModal); });
createPostModal.addEventListener('click', e => { if (e.target === createPostModal) closeModal(createPostModal); });

// prevQuestion.onclick = () => { currentIndex--; renderQuestion(); };
// nextQuestion.onclick = () => { currentIndex++; renderQuestion(); };

function updateQuestionNavigation() {
  const counterEl = document.getElementById('question-counter');
  const prevBtn = document.getElementById('prev-question');
  const nextBtn = document.getElementById('next-question');

  function updateUI() {
    renderQuestion();
    counterEl.textContent = `${currentIndex + 1} / ${totalQuestions}`;
    prevBtn.classList.toggle('hidden', currentIndex === 0);
    nextBtn.classList.toggle('hidden', currentIndex === totalQuestions - 1);
  }

  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateUI();
    }
  };

  nextBtn.onclick = () => {
    if (currentIndex < totalQuestions - 1) {
      currentIndex++;
      updateUI();
    }
  };

  updateUI(); // run initially
}

function closeModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// === New Post ===
newPostForm.addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(newPostForm);
  const questions = form.get('questions').split('\n').map(q => ({
    text: q.trim(),
    answers: {
      arnaav: { text: '', timestamp: null },
      devangshi: { text: '', timestamp: null }
    },
  ratings: {
    arnaav: 0,
    devangshi: 0
  }
  }));

  const post = {
    title: form.get('title'),
    author: form.get('author'),
    genres: form.get('genres').split(',').map(g => g.trim()),
    imageURL: form.get('imageURL'),
    shortDescription: form.get('shortDescription'),
    questions,
    timestamp: new Date()
  };

  if (editingPostId) {
    db.collection('posts').doc(editingPostId).update(post).then(() => {
      toast('Logs Reconfigured!');
      closeModal(createPostModal);
      editingPostId = null;
    });
  } else {
    db.collection('posts').add(post).then(() => {
      toast('Book Shelved! Haha get it? Bookshelf.');
      closeModal(createPostModal);
      currentUser = null;
      isAdmin = false;
      shelveBtn.style.display = 'none';
    });
  }
  
});

// === Edit/Delete ===
window.editPost = function(postId) {
  editingPostId = postId; // Track which post is being edited
  db.collection('posts').doc(postId).get().then(doc => {
    const data = doc.data();
    newPostForm.title.value = data.title;
    newPostForm.author.value = data.author;
    newPostForm.genres.value = data.genres.join(', ');
    newPostForm.imageURL.value = data.imageURL;
    newPostForm.shortDescription.value = data.shortDescription;
    newPostForm.questions.value = data.questions.map(q => q.text).join('\n');
    createPostModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
};


window.deletePost = function(postId) {
  if (confirm("Are you sure you want to delete this book post? It will literally be burned. Do you want to do that to books? What are you, anti-book? Go back to reading your Fahrenheit 451 or something.")) {
    db.collection('posts').doc(postId).delete().then(() => toast("Book Burned."));
  }
};

// === Toast Message ===
function toast(message) {
  const el = document.createElement('div');
  el.textContent = message;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1f2937',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  });
  document.body.appendChild(el);
  setTimeout(() => el.style.opacity = 1, 50);
  setTimeout(() => {
    el.style.opacity = 0;
    setTimeout(() => el.remove(), 1000);
  }, 3500);
}

// === Starfield Animation ===
const canvas = document.getElementById('starfield');
const ctx = canvas?.getContext('2d');

let stars = [];

function initStars() {
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2,
      velocity: Math.random() * 0.6 + 0.2
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.velocity;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}

function animateStars() {
  drawStars();
  requestAnimationFrame(animateStars);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

if (canvas) {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateStars();
}

aboutBtn.addEventListener('click', () => {
  aboutModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

aboutClose.addEventListener('click', () => {
  aboutModal.style.display = 'none';
  document.body.style.overflow = '';
});

aboutModal.addEventListener('click', e => {
  if (e.target === aboutModal) {
    aboutModal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

function updateTimer() {
  const startDate = new Date('2024-09-24T00:01:00-04:00'); // EST
  const now = new Date();
  
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  document.getElementById('years').textContent = String(years).padStart(2, '0');
  document.getElementById('months').textContent = String(months).padStart(2, '0');
  document.getElementById('days').textContent = String(days).padStart(2, '0');
}

setInterval(updateTimer, 60000);
updateTimer(); 

let currentRatings = {};

function renderRatings() {
  ['arnaav', 'devangshi'].forEach(user => {
    const container = document.querySelector(`.stars[data-user="${user}"]`);
    if (!container) return;

    const userRating = currentRatings[user] || 0;
    const editable = currentUser === user;

    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const span = document.createElement('span');
      const fullVal = i;
      const halfVal = i - 0.5;

      // Determine star type
      if (userRating >= fullVal) {
        span.classList.add('filled');
        span.textContent = '★';
      } else if (userRating >= halfVal) {
        span.classList.add('half');
        span.textContent = '☆';
      } else {
        span.textContent = '☆';
      }

      if (editable) {
        // Mouse move to detect half/full
        span.addEventListener('mousemove', e => {
          const rect = span.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const value = offsetX < rect.width / 2 ? i - 0.5 : i;
          highlightStars(container, value);
        });

        span.addEventListener('mouseleave', () => {
          highlightStars(container, userRating);
        });

        span.addEventListener('click', e => {
          const rect = span.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const value = offsetX < rect.width / 2 ? i - 0.5 : i;
          setRating(user, value);
        });
      }

      container.appendChild(span);
    }
  });
}



function highlightStars(container, rating) {
  const stars = container.querySelectorAll('span');
  stars.forEach((span, index) => {
    const i = index + 1;
    span.classList.remove('filled', 'half');
    if (rating >= i) {
      span.classList.add('filled');
      span.textContent = '★';
    } else if (rating >= i - 0.5) {
      span.classList.add('half');
      span.textContent = '☆';
    } else {
      span.textContent = '☆';
    }
  });
}


function setRating(user, value) {
  currentRatings[user] = value;
  renderRatings();
  if (!currentPostId) return;
  db.collection('posts').doc(currentPostId).update({
    [`ratings.${user}`]: value
  }).then(() => {
    toast('Appreciation Level Logged!');
  });
}


const commsBtn = document.getElementById('comms-module');
const commsModal = document.getElementById('comms-modal');
const interceptedModal = document.getElementById('intercepted-modal');
const commentForm = document.getElementById('comment-form');
const cancelComment = document.getElementById('cancel-comment');
const transmitBtn = document.getElementById('transmit-btn');
const interceptedList = document.getElementById('intercepted-list');
const interceptedClose = document.getElementById('intercepted-close');
const commsClose = document.getElementById('comms-close');

// Display comments

function deleteComment(id) {
  if (confirm("Are you sure you want to delete this transmission?")) {
    db.collection('comments').doc(id).delete().then(() => {
      loadComments(); // refresh list
    });
  }
}

function loadComments() {
  interceptedList.innerHTML = '<p>Fetching transmissions...</p>';
  db.collection('comments').orderBy('timestamp', 'desc').get().then(snapshot => {
    if (snapshot.empty) {
      interceptedList.innerHTML = "<p>It's silent out here in space. No transmissions yet.</p>";
      return;
    }

    interceptedList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = new Date(data.timestamp.seconds * 1000).toLocaleString();
      const showDelete = currentUser === 'arnaav' || currentUser === 'devangshi';
      interceptedList.innerHTML += `
  <div class="comment-block">
    ${currentUser === 'arnaav' || currentUser === 'devangshi' ? `
      <span class="delete-icon" onclick="deleteComment('${doc.id}')">🗑️</span>
    ` : ''}
    <strong>${data.name}</strong>
    <p>${data.message}</p>
    <div class="timestamp">${date}</div>
  </div>
`;

    });  
  });
}

// Comments button

commsBtn.addEventListener('click', () => {
  if (currentUser === 'arnaav' || currentUser === 'devangshi') {
    loadComments(); // show view modal
    interceptedModal.classList.add('show');
  } else {
    commsModal.classList.add('show'); // show hitchhiker form
  }
  document.body.style.overflow = 'hidden';
});

cancelComment.onclick = () => {
  commsModal.classList.remove('show');
  document.body.style.overflow = '';
};

commsClose.onclick = () => {
  commsModal.classList.remove('show');
  document.body.style.overflow = '';
};

interceptedClose.onclick = () => {
  interceptedModal.classList.remove('show');
  document.body.style.overflow = '';
};

interceptedModal.addEventListener('click', e => {
  if (e.target === interceptedModal) interceptedModal.classList.remove('show');
  document.body.style.overflow = ''; 
});

commsModal.addEventListener('click', e => {
  if (e.target === commsModal) commsModal.classList.remove('show');
  document.body.style.overflow = '';
});

// Add comment

commentForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = commentForm.name.value.trim();
  const message = commentForm.comment.value.trim();

  if (!name || !message) return;

  db.collection('comments').add({
    name,
    message,
    timestamp: new Date()
  }).then(() => {
    commentForm.reset();
    toast('Transmission sent!');
    commsModal.classList.remove('show');
    document.body.style.overflow = '';
  });
});

// Nyan cat!!!
const nyanCat = document.getElementById('nyan-cat');
const nyanTrigger = document.getElementById('nyan-trigger');

let sharedAudio = null;
let audioTimeout = null;

document.getElementById('nyan-trigger').addEventListener('click', () => {
  const nyan = document.createElement('img');
  nyan.src = 'nyan-cat.gif';
  nyan.className = 'nyan-cat';

  const startY = Math.floor(Math.random() * (window.innerHeight - 60));
  nyan.style.top = `${Math.max(20, startY)}px`;
  document.body.appendChild(nyan);

  // audios interrupt each other
  if (sharedAudio) {
    sharedAudio.pause();
    sharedAudio.currentTime = 0;
  } else {
    sharedAudio = new Audio('nyancat.mp3');
  }

  sharedAudio.play();

  if (audioTimeout) clearTimeout(audioTimeout);
  audioTimeout = setTimeout(() => {
    sharedAudio.pause();
    sharedAudio.currentTime = 0;
  }, 6000);

  // === Remove image after 5s ===
  setTimeout(() => {
    nyan.remove();
  }, 5000);
});


