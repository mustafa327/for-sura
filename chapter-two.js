(function () {
  const STORY = [
    {
      key: "secretDoor",
      label: "Chapter Two",
      title: "Welcome to the Secret World",
      text: "A door appeared where no door should be… and somehow, it was waiting for Sura.",
      button: "Enter the Secret World"
    },
    {
      key: "secretWorld",
      label: "The Velvet Path",
      title: "The lanterns woke up",
      text: "The cats already knew her name. They bowed softly, then showed her the way.",
      button: "Follow the Cats"
    },
    {
      key: "catCouncil",
      label: "The Cat Council",
      title: "Six cats. Seven chairs.",
      text: "Around the round table sat six guardians… and one empty chair glowing quietly.",
      button: "Meet the Council"
    }
  ];

  const CATS = [
    {
      name: "Kindness Cat",
      role: "Kindness",
      title: "Guardian of Kindness",
      question: "Would you share your last flower with a sad cat?",
      yes: "The Kindness Cat smiles. She knew your heart would say yes.",
      no: "The Kindness Cat laughs softly. Even honest answers are welcome here.",
      x: 28,
      y: 52,
      bubbleX: 33,
      bubbleY: 36
    },
    {
      name: "Patience Cat",
      role: "Patience",
      title: "Guardian of Patience",
      question: "Would you wait quietly while the moon finishes her tea?",
      yes: "The Patience Cat nods. Good things always arrive softly.",
      no: "The Patience Cat blinks slowly. The moon forgives impatience tonight.",
      x: 38,
      y: 44,
      bubbleX: 43,
      bubbleY: 28
    },
    {
      name: "Dreams Cat",
      role: "Dreams",
      title: "Guardian of Dreams",
      question: "Would you follow a tiny star if it blinked at you?",
      yes: "The Dreams Cat purrs. That is exactly how secret worlds are found.",
      no: "The Dreams Cat tilts her head. Some stars wait until you are ready.",
      x: 49,
      y: 39,
      bubbleX: 50,
      bubbleY: 22
    },
    {
      name: "Courage Cat",
      role: "Courage",
      title: "Guardian of Courage",
      question: "Would you open a door that softly meowed?",
      yes: "The Courage Cat raises one paw. Brave, but still elegant.",
      no: "The Courage Cat grins. A careful heart is also a brave one.",
      x: 60,
      y: 39,
      bubbleX: 60,
      bubbleY: 22
    },
    {
      name: "Secrets Cat",
      role: "Secrets",
      title: "Guardian of Secrets",
      question: "Can you keep a secret written in pawprints?",
      yes: "The Secrets Cat whispers: perfect. The pawprints trust you.",
      no: "The Secrets Cat smiles. Then this secret will keep itself.",
      x: 71,
      y: 44,
      bubbleX: 67,
      bubbleY: 28
    },
    {
      name: "Joy Cat",
      role: "Joy",
      title: "Guardian of Joy",
      question: "Would you dance if the lanterns started singing?",
      yes: "The Joy Cat almost claps. The lanterns were hoping you would.",
      no: "The Joy Cat spins anyway. Joy is allowed to be shy.",
      x: 82,
      y: 50,
      bubbleX: 73,
      bubbleY: 35
    }
  ];

  function mount(target) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) return;

    const config = window.CHAPTER_TWO_CONFIG || {};
    const imagePaths = config.imagePaths || {};
    const musicPath = config.musicPath || "";

    let mode = "story";
    let storyIndex = 0;
    let catIndex = 0;
    let answered = null;

    const audio = musicPath ? new Audio(musicPath) : null;
    if (audio) {
      audio.loop = true;
      audio.volume = 0.42;
      audio.preload = "auto";
    }

    document.body.classList.add("chapter-two-fullscreen");

    root.innerHTML = `
      <div class="chapter-two-immersive">
        <img class="chapter-two-bg-img" alt="" aria-hidden="true">

        <div class="chapter-two-image-stage">
          <div class="chapter-two-image-fit">
            <img class="chapter-two-main-img" alt="">
            <div class="cat-markers-layer" aria-hidden="true"></div>
            <div class="cat-question-bubble" hidden></div>
          </div>
        </div>

        <button class="chapter-tap-zone" type="button" aria-label="Continue story"></button>

        <div class="chapter-two-topbar">
          <span class="chapter-mini-label">The Velvet Paw Council</span>
          <button class="chapter-music-button" type="button">Play music</button>
        </div>

        <div class="chapter-overlay"></div>
        <div class="chapter-progress-dots" aria-hidden="true"></div>
      </div>
    `;

    const shell = root.querySelector(".chapter-two-immersive");
    const bgImg = root.querySelector(".chapter-two-bg-img");
    const mainImg = root.querySelector(".chapter-two-main-img");
    const tapZone = root.querySelector(".chapter-tap-zone");
    const overlay = root.querySelector(".chapter-overlay");
    const musicButton = root.querySelector(".chapter-music-button");
    const bubble = root.querySelector(".cat-question-bubble");
    const dots = root.querySelector(".chapter-progress-dots");
    const markersLayer = root.querySelector(".cat-markers-layer");

    function imageFor(key) {
      return imagePaths[key] || "";
    }

    function setImage(key, alt) {
      const src = imageFor(key);
      bgImg.src = src;
      mainImg.src = src;
      mainImg.alt = alt || "";
    }

    async function playMusic() {
      if (!audio) return;

      try {
        await audio.play();
        musicButton.textContent = "Mute music";
      } catch (error) {
        musicButton.textContent = "Tap for music";
      }
    }

    function toggleMusic(event) {
      event.stopPropagation();
      if (!audio) return;

      if (audio.paused) {
        playMusic();
      } else {
        audio.pause();
        musicButton.textContent = "Play music";
      }
    }

    function setStoryTapEnabled(enabled) {
      tapZone.disabled = !enabled;
      tapZone.style.pointerEvents = enabled ? "auto" : "none";
    }

    function goNextStory() {
      if (storyIndex === 0) {
        playMusic();
      }

      if (storyIndex < STORY.length - 1) {
        storyIndex += 1;
        render();
        return;
      }

      mode = "cats";
      catIndex = 0;
      answered = null;
      render();
    }

    function answerCat(choice) {
      answered = choice;
      render();
    }

    function nextCat() {
      if (catIndex < CATS.length - 1) {
        catIndex += 1;
        answered = null;
        render();
        return;
      }

      mode = "final";
      render();
    }

    function replay() {
      mode = "story";
      storyIndex = 0;
      catIndex = 0;
      answered = null;
      render();
    }

    function renderDots() {
      const total = STORY.length + CATS.length + 1;
      let current = storyIndex;

      if (mode === "cats") current = STORY.length + catIndex;
      if (mode === "final") current = total - 1;

      dots.innerHTML = Array.from({ length: total }, (_, i) => {
        return `<span class="${i === current ? "is-active" : ""}"></span>`;
      }).join("");
    }

    function renderAllCatMarkers(activeIndex) {
      markersLayer.innerHTML = CATS.map((cat, index) => `
        <div
          class="cat-pin ${index === activeIndex ? "is-active" : ""}"
          style="left:${cat.x}%; top:${cat.y}%;"
        >
          <span class="cat-pin-dot"></span>
          <span class="cat-pin-label">${cat.role}</span>
        </div>
      `).join("");
    }

    function renderStory() {
      const step = STORY[storyIndex];
      setImage(step.key, step.title);
      setStoryTapEnabled(true);

      shell.className = "chapter-two-immersive is-story-mode";
      markersLayer.innerHTML = "";
      bubble.hidden = true;

      overlay.className = "chapter-overlay";
      overlay.innerHTML = `
        <div class="chapter-glass-card">
          <span class="chapter-kicker">${step.label}</span>
          <h1 id="chapterTwoTitle">${step.title}</h1>
          <p>${step.text}</p>
          <button class="chapter-main-button" type="button">${step.button}</button>
          <small>or tap anywhere on the image</small>
        </div>
      `;

      overlay.querySelector(".chapter-main-button").addEventListener("click", function (event) {
        event.stopPropagation();
        goNextStory();
      });
    }

    function renderCatQuestion() {
      const cat = CATS[catIndex];
      setImage("catCouncil", "The Cat Council");
      setStoryTapEnabled(false);

      shell.className = "chapter-two-immersive is-cat-mode";
      renderAllCatMarkers(catIndex);

      overlay.className = "chapter-overlay is-small";
      overlay.innerHTML = `
        <div class="chapter-small-card">
          <span>${catIndex + 1} / ${CATS.length}</span>
          <strong>${cat.title}</strong>
        </div>
      `;

      bubble.hidden = false;
      bubble.style.left = `${cat.bubbleX}%`;
      bubble.style.top = `${cat.bubbleY}%`;

      if (!answered) {
        bubble.innerHTML = `
          <span class="cat-speaker">${cat.name}</span>
          <p>${cat.question}</p>
          <div class="cat-answer-row">
            <button type="button" data-answer="yes">Yes</button>
            <button type="button" data-answer="no">No</button>
          </div>
        `;

        bubble.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", function (event) {
            event.stopPropagation();
            answerCat(button.dataset.answer);
          });
        });
        return;
      }

      bubble.innerHTML = `
        <span class="cat-speaker">${cat.name}</span>
        <p>${answered === "yes" ? cat.yes : cat.no}</p>
        <button class="cat-next-button" type="button">
          ${catIndex === CATS.length - 1 ? "Go to the Seventh Chair" : "Next Cat"}
        </button>
      `;

      bubble.querySelector(".cat-next-button").addEventListener("click", function (event) {
        event.stopPropagation();
        nextCat();
      });
    }

    function renderFinal() {
      setImage("seventhChair", "The Seventh Chair");
      setStoryTapEnabled(false);

      shell.className = "chapter-two-immersive is-final-mode";
      markersLayer.innerHTML = "";
      bubble.hidden = true;

      overlay.className = "chapter-overlay is-center";
      overlay.innerHTML = `
        <div class="chapter-glass-card final-card">
          <span class="chapter-kicker">The Seventh Chair</span>
          <h1>The council has decided…</h1>
          <p>Welcome, Sura. The seventh chair was never empty. It was only waiting for you.</p>
          <strong>Take your seat, Seventh Heart.</strong>
          <button class="chapter-main-button" type="button">Replay the Secret World</button>
        </div>
      `;

      overlay.querySelector(".chapter-main-button").addEventListener("click", function (event) {
        event.stopPropagation();
        replay();
      });
    }

    function render() {
      renderDots();

      if (mode === "story") {
        renderStory();
        return;
      }

      if (mode === "cats") {
        renderCatQuestion();
        return;
      }

      renderFinal();
    }

    tapZone.addEventListener("click", function () {
      if (mode === "story") {
        goNextStory();
      }
    });

    musicButton.addEventListener("click", toggleMusic);

    render();
  }

  window.ChapterTwo = { mount };
})();