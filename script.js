const SURPRISE_CONFIG = {
  // Change this name if you want the whole surprise to be for someone else.
  friendName: "Sura",
  senderName: "Mustafa",
  unlockAnswer: "sura",
  birthdayLateDays: 7,

  // Put your audio file at music/song.mp3. iPhone Safari only plays it after a tap.
  musicPath: "music/song.mp3",

  // Edit these lines to change the wishes in the game and the wishes section.
  wishes: [
    "Peace in your heart",
    "Happiness that stays",
    "People who truly value you",
    "Success in everything you care about",
    "Health, comfort, and calm days",
    "Beautiful memories this year",
    "A life that keeps surprising you in good ways"
  ],

  trickMessages: [
    {
      type: "sleepy",
      title: "Sleepy cat",
      message: "Not this one... this cat is still waking up."
    },
    {
      type: "mischief",
      title: "Mischievous cat",
      message: "This cat tried to hide the wish because {senderName} was {birthdayLateDays} days late."
    }
  ],

  // Edit this text to change the cat cards shown later in the page.
  catCards: [
    {
      type: "balloon",
      title: "Cat with balloons",
      text: "A little balloon cat carrying late birthday wishes."
    },
    {
      type: "sleepy",
      title: "Cozy sleepy cat",
      text: "For calm days, warm moments, and peace in your heart."
    },
    {
      type: "cake",
      title: "Birthday cat with cake",
      text: "For sweet memories and a year full of beautiful surprises."
    },
    {
      type: "starry",
      title: "Starry cat",
      text: "For dreams that quietly come true."
    }
  ],

  // Edit this message to personalize the letter.
  mainMessage: `Dear Sura,

I know this birthday wish came 7 days late, but I still wanted it to feel special.

Since you love cats, I thought a normal message was not enough — so I made you this small cat-themed surprise.

I hope this new year of your life brings you soft days, happy moments, peaceful nights, and people who truly value you.

May your heart stay light, your smile stay real, and your year be full of beautiful little surprises.

Happy late birthday, Sura.

Late by 7 days... but still from the heart.`
};

const state = {
  collectedWishes: 0,
  openedCards: new Set(),
  audio: null,
  isMusicPlaying: false
};

const elements = {
  lockScreen: document.querySelector("#lockScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  giftScreen: document.querySelector("#giftScreen"),
  mainContent: document.querySelector("#mainContent"),
  unlockForm: document.querySelector("#unlockForm"),
  unlockAnswer: document.querySelector("#unlockAnswer"),
  unlockMessage: document.querySelector("#unlockMessage"),
  gameGrid: document.querySelector("#gameGrid"),
  wishProgress: document.querySelector("#wishProgress"),
  progressBar: document.querySelector("#progressBar"),
  gameComplete: document.querySelector("#gameComplete"),
  openGiftButton: document.querySelector("#openGiftButton"),
  giftBox: document.querySelector("#giftBox"),
  giftMessage: document.querySelector("#giftMessage"),
  continueButton: document.querySelector("#continueButton"),
  heroTitle: document.querySelector("#heroTitle"),
  heroSubtitle: document.querySelector("#heroSubtitle"),
  heroArt: document.querySelector("#heroArt"),
  wishList: document.querySelector("#wishList"),
  catShowcase: document.querySelector("#catShowcase"),
  mainMessage: document.querySelector("#mainMessage"),
  replayButton: document.querySelector("#replayButton"),
  musicToggle: document.querySelector("#musicToggle"),
  confettiLayer: document.querySelector("#confettiLayer")
};

function init() {
  renderIntroText();
  renderHero();
  renderGameCards();
  renderWishes();
  renderCatCards();
  renderMessage();
  setupEvents();
  setupRevealAnimations();
  setupMusic();
}

function setupEvents() {
  elements.unlockForm.addEventListener("submit", handleUnlock);
  elements.openGiftButton.addEventListener("click", () => showScreen("gift"));
  elements.giftBox.addEventListener("click", openGift);
  elements.continueButton.addEventListener("click", showMainContent);
  elements.replayButton.addEventListener("click", resetExperience);
}

function renderIntroText() {
  document.title = `For ${SURPRISE_CONFIG.friendName}`;
  document.querySelector("#lockTitle").textContent = `For ${SURPRISE_CONFIG.friendName}`;
  document.querySelector("#lockSubtitle").textContent = "A little late... but made only for you.";
  document.querySelector("#lockOnlyText").textContent = `Only ${SURPRISE_CONFIG.friendName} can open this little surprise.`;
  document.querySelector("#gameSubtitle").textContent = `I’m ${SURPRISE_CONFIG.birthdayLateDays} days late, so I hid ${SURPRISE_CONFIG.wishes.length} wishes with the cats.`;
  document.querySelector("#finalTitle").textContent = `Late by ${SURPRISE_CONFIG.birthdayLateDays} days... but still wishing you the best for the whole year.`;
}

function handleUnlock(event) {
  event.preventDefault();
  const answer = elements.unlockAnswer.value.trim().toLowerCase();

  if (answer === SURPRISE_CONFIG.unlockAnswer.toLowerCase()) {
    elements.unlockMessage.textContent = "";
    showScreen("game");
    return;
  }

  elements.unlockMessage.textContent = `Hmm... this surprise is only for ${SURPRISE_CONFIG.friendName} 🐾`;
}

function showScreen(screenName) {
  elements.lockScreen.classList.toggle("is-active", screenName === "lock");
  elements.gameScreen.classList.toggle("is-active", screenName === "game");
  elements.giftScreen.classList.toggle("is-active", screenName === "gift");
  elements.mainContent.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMainContent() {
  elements.lockScreen.classList.remove("is-active");
  elements.gameScreen.classList.remove("is-active");
  elements.giftScreen.classList.remove("is-active");
  elements.mainContent.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  markVisibleReveals();
}

function renderHero() {
  elements.heroTitle.textContent = `Happy Late Birthday, ${SURPRISE_CONFIG.friendName}`;
  elements.heroSubtitle.textContent = `I know I’m ${SURPRISE_CONFIG.birthdayLateDays} days late, but maybe your birthday deserved more than just one day.`;
  elements.heroArt.innerHTML = getHeroCatSvg();
}

function renderGameCards() {
  const wishCards = SURPRISE_CONFIG.wishes.map((wish, index) => ({
    id: `wish-${index}`,
    kind: "wish",
    title: `Wish ${index + 1}`,
    message: wish,
    catType: getGameCatType(index)
  }));

  const trickCards = SURPRISE_CONFIG.trickMessages.map((trick, index) => ({
    id: `trick-${index}`,
    kind: "trick",
    title: trick.title,
    message: trick.message,
    catType: trick.type
  }));

  const cards = shuffleCards([...wishCards, ...trickCards]);
  elements.gameGrid.innerHTML = "";

  cards.forEach((card) => {
    const button = document.createElement("button");
    button.className = "cat-card-button tap-target";
    button.type = "button";
    button.dataset.cardId = card.id;
    button.dataset.kind = card.kind;
    button.setAttribute("aria-label", `Open ${card.title}`);

    button.innerHTML = `
      <span class="cat-card-inner">
        <span class="card-face card-front">
          <span class="cat-mini" aria-hidden="true">${getMiniCatSvg(card.catType)}</span>
          <strong>${card.title}</strong>
        </span>
        <span class="card-face card-back">
          <span>
            <span class="wish-mark" aria-hidden="true">${card.kind === "wish" ? "✦" : "?"}</span>
            <p>${formatText(card.message)}</p>
          </span>
        </span>
      </span>
    `;

    button.addEventListener("click", () => flipCard(button, card));
    elements.gameGrid.appendChild(button);
  });

  updateProgress();
}

function flipCard(button, card) {
  if (state.openedCards.has(card.id)) return;

  state.openedCards.add(card.id);
  button.classList.add("is-open");
  button.setAttribute("aria-pressed", "true");

  if (card.kind === "wish") {
    state.collectedWishes += 1;
    updateProgress();
  }

  if (state.collectedWishes === SURPRISE_CONFIG.birthdayLateDays) {
    finishGame();
  }
}

function updateProgress() {
  const total = SURPRISE_CONFIG.birthdayLateDays;
  const collected = state.collectedWishes;
  elements.wishProgress.textContent = `${collected} / ${total} wishes collected`;
  elements.progressBar.style.width = `${(collected / total) * 100}%`;
}

function finishGame() {
  if (!elements.gameComplete.hidden) return;
  elements.gameComplete.hidden = false;
  launchConfetti();
}

function openGift() {
  if (elements.giftBox.classList.contains("is-open")) return;
  elements.giftBox.classList.add("is-open");
  elements.giftMessage.hidden = false;
  launchConfetti();
}

function renderWishes() {
  elements.wishList.innerHTML = "";

  SURPRISE_CONFIG.wishes.forEach((wish, index) => {
    const card = document.createElement("article");
    card.className = "wish-card reveal";
    card.innerHTML = `
      <span class="day-chip">Day ${index + 1}</span>
      <p>I wish you ${lowercaseFirst(wish)}.</p>
    `;
    elements.wishList.appendChild(card);
  });
}

function renderCatCards() {
  elements.catShowcase.innerHTML = "";

  SURPRISE_CONFIG.catCards.forEach((cat) => {
    const card = document.createElement("article");
    card.className = "cat-profile reveal";
    card.innerHTML = `
      <span class="cat-illustration" aria-hidden="true">${getCatCardSvg(cat.type)}</span>
      <span>
        <h3>${cat.title}</h3>
        <p>${cat.text}</p>
      </span>
    `;
    elements.catShowcase.appendChild(card);
  });
}

function renderMessage() {
  elements.mainMessage.innerHTML = SURPRISE_CONFIG.mainMessage
    .split("\n\n")
    .map((paragraph) => `<p>${formatText(paragraph)}</p>`)
    .join("");
}

function setupRevealAnimations() {
  if (!("IntersectionObserver" in window)) {
    markVisibleReveals();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function markVisibleReveals() {
  document.querySelectorAll(".reveal").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      element.classList.add("is-visible");
    }
  });
}

function setupMusic() {
  state.audio = new Audio(SURPRISE_CONFIG.musicPath);
  state.audio.loop = true;
  state.audio.preload = "none";

  elements.musicToggle.addEventListener("click", async () => {
    if (!state.isMusicPlaying) {
      try {
        await state.audio.play();
        state.isMusicPlaying = true;
        elements.musicToggle.textContent = "Pause music";
      } catch (error) {
        state.isMusicPlaying = false;
        elements.musicToggle.textContent = "Music file not found";
        window.setTimeout(() => {
          if (!state.isMusicPlaying) elements.musicToggle.textContent = "Play music 🎵";
        }, 1800);
      }
      return;
    }

    state.audio.pause();
    state.isMusicPlaying = false;
    elements.musicToggle.textContent = "Play music 🎵";
  });

  state.audio.addEventListener("error", () => {
    state.isMusicPlaying = false;
  });
}

function resetExperience() {
  state.collectedWishes = 0;
  state.openedCards.clear();
  elements.unlockAnswer.value = "";
  elements.unlockMessage.textContent = "";
  elements.gameComplete.hidden = true;
  elements.giftMessage.hidden = true;
  elements.giftBox.classList.remove("is-open");
  renderGameCards();
  document.querySelectorAll(".reveal").forEach((element) => element.classList.remove("is-visible"));
  showScreen("lock");
}

function launchConfetti() {
  const colors = ["#f6b7c8", "#c9b8ff", "#d7ad55", "#fff7e8", "#c7ded0", "#ffffff"];
  const pieces = 76;
  elements.confettiLayer.innerHTML = "";

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.setProperty("--fall-time", `${1800 + Math.random() * 1500}ms`);
    piece.style.animationDelay = `${Math.random() * 220}ms`;
    elements.confettiLayer.appendChild(piece);
  }

  window.setTimeout(() => {
    elements.confettiLayer.innerHTML = "";
  }, 3800);
}

function shuffleCards(cards) {
  return cards
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);
}

function lowercaseFirst(text) {
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function formatText(text) {
  return text
    .replaceAll("{friendName}", SURPRISE_CONFIG.friendName)
    .replaceAll("{senderName}", SURPRISE_CONFIG.senderName)
    .replaceAll("{birthdayLateDays}", SURPRISE_CONFIG.birthdayLateDays);
}

function getGameCatType(index) {
  const types = ["balloon", "sleepy", "cake", "starry", "flower", "gold", "lavender"];
  return types[index % types.length];
}

function getMiniCatSvg(type) {
  const palette = {
    balloon: ["#fff0d7", "#d96d8f"],
    sleepy: ["#f4e6ff", "#7864bc"],
    cake: ["#fff7e8", "#d7ad55"],
    starry: ["#ede7ff", "#c79b35"],
    flower: ["#ffe8ef", "#d96d8f"],
    gold: ["#fff2c9", "#b9872f"],
    lavender: ["#f2edff", "#7864bc"],
    mischief: ["#ffe6ef", "#d96d8f"]
  };
  const [fur, accent] = palette[type] || palette.balloon;

  return `
    <svg viewBox="0 0 120 120" role="img" aria-label="Cat illustration">
      <path d="M26 58 L34 25 L54 45 L70 45 L90 25 L96 58 Q104 88 60 98 Q16 88 26 58Z" fill="${fur}" stroke="#6b5364" stroke-width="3"/>
      <circle cx="45" cy="62" r="4" fill="#352c38"/>
      <circle cx="75" cy="62" r="4" fill="#352c38"/>
      <path d="M58 70 Q60 73 62 70" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
      <path d="M45 79 Q60 89 75 79" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
      <path d="M35 70 H18 M37 77 H20 M83 70 H102 M81 77 H100" stroke="#a07d8f" stroke-width="2" stroke-linecap="round"/>
      <circle cx="89" cy="39" r="9" fill="${accent}" opacity="0.82"/>
    </svg>
  `;
}

function getHeroCatSvg() {
  return `
    <svg viewBox="0 0 520 500" role="img" aria-label="Pastel birthday cat with balloons">
      <rect x="86" y="72" width="348" height="344" rx="34" fill="rgba(255,255,255,0.52)" stroke="rgba(215,173,85,0.34)" stroke-width="3"/>
      <path d="M164 355 C126 312 142 246 196 226 C234 211 278 213 318 226 C372 244 389 312 350 355 C310 399 205 399 164 355Z" fill="#fff2df" stroke="#5e4a59" stroke-width="5"/>
      <path d="M177 255 L190 165 L240 218 Z" fill="#fff2df" stroke="#5e4a59" stroke-width="5"/>
      <path d="M340 255 L325 165 L280 218 Z" fill="#fff2df" stroke="#5e4a59" stroke-width="5"/>
      <path d="M218 146 L253 70 L290 146 Z" fill="#c9b8ff" stroke="#5e4a59" stroke-width="4"/>
      <path d="M236 111 H273" stroke="#fff7e8" stroke-width="8" stroke-linecap="round"/>
      <circle cx="253" cy="63" r="13" fill="#d7ad55"/>
      <circle cx="224" cy="286" r="8" fill="#352c38"/>
      <circle cx="296" cy="286" r="8" fill="#352c38"/>
      <path d="M255 307 Q260 314 265 307" fill="none" stroke="#352c38" stroke-width="5" stroke-linecap="round"/>
      <path d="M230 329 Q260 349 292 329" fill="none" stroke="#352c38" stroke-width="5" stroke-linecap="round"/>
      <path d="M204 314 H145 M207 330 H151 M314 314 H374 M311 330 H368" stroke="#a5798c" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="199" cy="311" rx="15" ry="10" fill="#f6b7c8" opacity="0.72"/>
      <ellipse cx="321" cy="311" rx="15" ry="10" fill="#f6b7c8" opacity="0.72"/>
      <path d="M373 225 C423 177 448 125 420 98 C392 72 348 103 360 142 C366 161 376 182 373 225Z" fill="#f6b7c8" stroke="#5e4a59" stroke-width="4"/>
      <path d="M137 219 C90 165 86 110 119 92 C154 73 185 111 165 148 C155 167 140 185 137 219Z" fill="#c9b8ff" stroke="#5e4a59" stroke-width="4"/>
      <path d="M378 225 C350 254 333 286 323 327 M137 219 C164 250 182 284 194 326" fill="none" stroke="#d7ad55" stroke-width="3"/>
      <path d="M107 383 L125 389 L107 395 L101 413 L95 395 L77 389 L95 383 L101 365Z" fill="#d7ad55" opacity="0.76"/>
      <path d="M424 319 L437 324 L424 329 L419 342 L414 329 L401 324 L414 319 L419 306Z" fill="#d7ad55" opacity="0.68"/>
      <circle cx="409" cy="391" r="8" fill="#c7ded0"/>
      <circle cx="116" cy="165" r="7" fill="#fff7e8"/>
    </svg>
  `;
}

function getCatCardSvg(type) {
  const svgs = {
    balloon: `
      <svg viewBox="0 0 150 150" role="img" aria-label="Cat with balloons">
        <path d="M30 106 C17 80 31 49 60 42 C89 36 119 52 121 82 C123 113 89 129 59 122 C45 119 36 114 30 106Z" fill="#fff2df" stroke="#5e4a59" stroke-width="4"/>
        <path d="M43 58 L48 25 L69 50Z M105 58 L99 25 L80 50Z" fill="#fff2df" stroke="#5e4a59" stroke-width="4"/>
        <circle cx="61" cy="80" r="4" fill="#352c38"/><circle cx="91" cy="80" r="4" fill="#352c38"/>
        <path d="M73 92 Q76 96 79 92 M62 102 Q76 111 91 102" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="120" cy="31" rx="16" ry="20" fill="#f6b7c8" stroke="#5e4a59" stroke-width="3"/>
        <ellipse cx="94" cy="24" rx="14" ry="18" fill="#c9b8ff" stroke="#5e4a59" stroke-width="3"/>
        <path d="M115 50 C103 66 97 78 91 103 M94 42 C90 58 84 72 78 102" fill="none" stroke="#d7ad55" stroke-width="2"/>
      </svg>
    `,
    sleepy: `
      <svg viewBox="0 0 150 150" role="img" aria-label="Sleepy cat">
        <path d="M31 98 C31 64 56 44 82 49 C112 54 128 77 116 103 C105 128 51 128 31 98Z" fill="#f4e6ff" stroke="#5e4a59" stroke-width="4"/>
        <path d="M44 64 L55 34 L71 58Z M107 66 L98 34 L83 58Z" fill="#f4e6ff" stroke="#5e4a59" stroke-width="4"/>
        <path d="M58 82 Q65 88 72 82 M88 82 Q95 88 102 82" fill="none" stroke="#352c38" stroke-width="4" stroke-linecap="round"/>
        <path d="M74 95 Q77 99 80 95 M64 104 Q78 113 93 104" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <path d="M25 118 H122" stroke="#d7ad55" stroke-width="8" stroke-linecap="round" opacity="0.45"/>
        <path d="M111 31 H132 L115 51 H135" fill="none" stroke="#7864bc" stroke-width="5" stroke-linejoin="round"/>
      </svg>
    `,
    cake: `
      <svg viewBox="0 0 150 150" role="img" aria-label="Birthday cat with cake">
        <path d="M33 94 C23 65 45 43 75 43 C105 43 127 65 117 94 C108 121 42 121 33 94Z" fill="#fff2df" stroke="#5e4a59" stroke-width="4"/>
        <path d="M45 58 L53 30 L69 51Z M105 58 L97 30 L81 51Z" fill="#fff2df" stroke="#5e4a59" stroke-width="4"/>
        <circle cx="63" cy="76" r="4" fill="#352c38"/><circle cx="88" cy="76" r="4" fill="#352c38"/>
        <path d="M73 87 Q76 91 79 87 M63 97 Q76 105 90 97" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <rect x="46" y="104" width="61" height="26" rx="6" fill="#f6b7c8" stroke="#5e4a59" stroke-width="3"/>
        <path d="M46 112 C58 121 67 103 78 112 C90 121 96 104 107 112" fill="none" stroke="#fff7e8" stroke-width="4" stroke-linecap="round"/>
        <path d="M75 99 V83" stroke="#d7ad55" stroke-width="4" stroke-linecap="round"/>
        <path d="M75 77 C69 68 79 68 75 58 C85 67 86 75 75 77Z" fill="#d7ad55"/>
      </svg>
    `,
    starry: `
      <svg viewBox="0 0 150 150" role="img" aria-label="Starry cat">
        <path d="M32 97 C24 63 49 42 78 45 C108 48 127 72 116 101 C106 126 42 126 32 97Z" fill="#ede7ff" stroke="#5e4a59" stroke-width="4"/>
        <path d="M45 59 L54 28 L70 53Z M108 61 L98 28 L82 53Z" fill="#ede7ff" stroke="#5e4a59" stroke-width="4"/>
        <circle cx="63" cy="79" r="4" fill="#352c38"/><circle cx="91" cy="79" r="4" fill="#352c38"/>
        <path d="M75 91 Q78 95 81 91 M65 101 Q78 109 92 101" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <path d="M31 31 L38 44 L52 47 L41 57 L43 72 L31 65 L18 72 L21 57 L10 47 L24 44Z" fill="#d7ad55" opacity="0.8"/>
        <path d="M119 21 L124 31 L135 34 L126 42 L128 54 L119 48 L109 54 L111 42 L102 34 L114 31Z" fill="#f6b7c8" opacity="0.85"/>
      </svg>
    `
  };

  return svgs[type] || svgs.starry;
}

init();
