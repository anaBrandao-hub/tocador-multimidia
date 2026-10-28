const playlist = [
  {
    title: "Track Mind",
    artist: "Naïka",
    src: "./assets/musica1.mpeg",
    cover: "./assets/capa1.jpg",
  },
  {
    title: "Friends",
    artist: "V",
    src: "./assets/musica2.mp3",
    cover: "./assets/capa2.jpeg",
  },
  {
    title: "Roslyn",
    artist: "Bon Iver, St. Vincent ",
    src: "./assets/musica3.mp3",
    cover: "./assets/capa3.jpeg",
  },
];

const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const btnPlay = document.getElementById("btn-play");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const playlistList = document.getElementById("playlist-list");

let currentIndex = 0;
let isSeeking = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function updateProgressFill() {
  progress.style.setProperty("--progress", `${progress.value}%`);
}

function renderPlaylist() {
  playlistList.innerHTML = playlist
    .map(
      (track, index) => `
      <li class="${index === currentIndex ? "active" : ""}" data-index="${index}">
        <button type="button" aria-label="Tocar ${track.title}">
          <span class="track-meta">
            <span class="track-name">${track.title}</span>
            <span class="track-artist">${track.artist}</span>
          </span>
          <span class="track-index">${String(index + 1).padStart(2, "0")}</span>
        </button>
      </li>
    `
    )
    .join("");
}

function loadTrack(index) {
  currentIndex = (index + playlist.length) % playlist.length;
  const track = playlist[currentIndex];

  audio.src = track.src;
  cover.src = track.cover;
  cover.alt = `Capa de ${track.title}`;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  progress.value = 0;
  updateProgressFill();
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  document.querySelectorAll("#playlist-list li").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.index) === currentIndex);
  });
}

function setPlayIcon(playing) {
  const icon = btnPlay.querySelector("i");
  icon.classList.toggle("fa-play", !playing);
  icon.classList.toggle("fa-pause", playing);
  btnPlay.setAttribute("aria-label", playing ? "Pausar" : "Reproduzir");
}

async function playAudio() {
  try {
    await audio.play();
    setPlayIcon(true);
  } catch (error) {
    setPlayIcon(false);
    console.warn("Não foi possível reproduzir o áudio. Verifique os arquivos em ./assets.", error);
  }
}

function pauseAudio() {
  audio.pause();
  setPlayIcon(false);
}

function togglePlay() {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function nextTrack() {
  loadTrack(currentIndex + 1);
  playAudio();
}

function prevTrack() {
  loadTrack(currentIndex - 1);
  playAudio();
}

function updateProgress() {
  if (isSeeking || !audio.duration) {
    return;
  }

  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = percent.toFixed(1);
  updateProgressFill();
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

progress.addEventListener("input", () => {
  isSeeking = true;
  updateProgressFill();
  if (audio.duration) {
    currentTimeEl.textContent = formatTime((progress.value / 100) * audio.duration);
  }
});

progress.addEventListener("change", () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
  isSeeking = false;
});

audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", nextTrack);

cover.addEventListener("error", () => {
  cover.removeAttribute("src");
});

btnPlay.addEventListener("click", togglePlay);
btnNext.addEventListener("click", nextTrack);
btnPrev.addEventListener("click", prevTrack);

playlistList.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) {
    return;
  }

  const index = Number(item.dataset.index);
  loadTrack(index);
  playAudio();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && event.target === document.body) {
    event.preventDefault();
    togglePlay();
  }
});

renderPlaylist();
loadTrack(0);
updateProgressFill();
