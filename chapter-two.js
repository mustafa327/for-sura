(function () {
  const CHAIR_POSITIONS = [
    { x: 50, y: 8 },
    { x: 78, y: 22 },
    { x: 88, y: 54 },
    { x: 70, y: 80 },
    { x: 30, y: 80 },
    { x: 12, y: 54 }
  ];
  const EMPTY_CHAIR_POSITION = { x: 50, y: 94 };

  function mount(target) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    const data = window.CHAPTER_TWO_LORE;
    const config = window.CHAPTER_TWO_CONFIG;

    if (!root || !data || !config) return;

    const cats = data.cats.slice(0, 6);
    const reducedMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false, addEventListener: null };

    const state = {
      currentPanel: 0,
      visitedCats: new Set(),
      entered: false,
      panelTimer: null,
      audio: null,
      themeAvailable: true
    };

    applyTheme(root, config.colors);
    root.innerHTML = renderChapter(data, config, cats);

    const refs = {
      enterButton: root.querySelector("[data-chapter-enter]"),
      musicToggle: root.querySelector("[data-chapter-music]"),
      story: root.querySelector("[data-story]"),
      storyCopy: root.querySelector("[data-story-copy]"),
      panelTitle: root.querySelector("[data-panel-title]"),
      panelText: root.querySelector("[data-panel-text]"),
      panelCount: root.querySelector("[data-panel-count]"),
      panels: Array.from(root.querySelectorAll("[data-story-panel]")),
      navButtons: Array.from(root.querySelectorAll("[data-panel-nav]")),
      catButtons: Array.from(root.querySelectorAll("[data-cat-token]")),
      questionPanel: root.querySelector("[data-question-panel]"),
      questionTitle: root.querySelector("[data-question-title]"),
      questionText: root.querySelector("[data-question-text]"),
      responseText: root.querySelector("[data-question-response]"),
      answerButtons: Array.from(root.querySelectorAll("[data-answer-choice]")),
      progressText: root.querySelector("[data-council-progress]"),
      finalPanel: root.querySelector("[data-final-panel]"),
      councilStage: root.querySelector("[data-council-stage]")
    };

    setupAudio(state, refs, config);
    setupImageFallbacks(refs.panels);
    setupPanelNavigation(data, config, state, refs, reducedMotion);
    setupCatGame(data, cats, state, refs);
    setupEntry(data, config, state, refs, reducedMotion);
    setupParallax(root, refs, reducedMotion);
    setupPawTrail(root, reducedMotion);
    activatePanel(0, data, state, refs);
    updateProgress(cats.length, state, refs);
  }

  function renderChapter(data, config, cats) {
    return `
      <div class="chapter-two-bg" aria-hidden="true">${renderFloaters(22)}</div>
      <div class="chapter-two-shell">
        <div class="chapter-two-heading reveal">
          <div class="mini-badge">${escapeHtml(data.eyebrow)}</div>
          <h2 id="chapterTwoTitle">${escapeHtml(data.title)}</h2>
          <p>${escapeHtml(data.intro)}</p>
        </div>

        <div class="chapter-two-actions reveal">
          <button class="primary-button tap-target chapter-enter-button" type="button" data-chapter-enter>
            ${escapeHtml(data.enterButtonLabel)}
          </button>
          <button class="secondary-button tap-target chapter-music-toggle" type="button" data-chapter-music disabled aria-pressed="false">
            Music locked
          </button>
        </div>

        <div class="chapter-story reveal" data-story>
          <div class="story-frame" data-parallax-layer>
            <div class="story-slides">
              ${data.storyPanels.map((panel, index) => renderStoryPanel(panel, index, config)).join("")}
            </div>
            <span class="chapter-candle candle-one" aria-hidden="true"></span>
            <span class="chapter-candle candle-two" aria-hidden="true"></span>
            <div class="story-panel-nav" role="tablist" aria-label="Chapter Two story panels">
              ${data.storyPanels.map((panel, index) => `
                <button type="button" data-panel-nav="${index}" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-label="${escapeAttribute(panel.title)}"></button>
              `).join("")}
            </div>
          </div>
          <div class="story-copy" data-story-copy aria-live="polite">
            <span class="story-count" data-panel-count></span>
            <h3 data-panel-title></h3>
            <p data-panel-text></p>
          </div>
        </div>

        <div class="council-game reveal" aria-labelledby="councilGameTitle">
          <div class="council-game-copy">
            <div class="mini-badge">earn the seventh chair</div>
            <h3 id="councilGameTitle">Earn the Seventh Chair</h3>
            <p>Six glowing cat tokens wait around the table. Click each council cat and answer in whatever soft way feels true.</p>
            <p class="council-progress" data-council-progress aria-live="polite"></p>
          </div>

          <div class="council-layout">
            <div class="council-table-stage" data-council-stage data-parallax-layer aria-label="The Velvet Paw Council table with six occupied chairs and one empty chair for Sura">
              <div class="round-table" aria-hidden="true">
                <span>${escapeHtml(data.councilName)}</span>
                <i class="table-candle"></i>
                <i class="table-candle second"></i>
              </div>
              ${cats.map((cat, index) => renderCatChair(cat, index)).join("")}
              ${renderEmptyChair(data)}
            </div>

            <aside class="cat-question-panel" data-question-panel aria-live="polite">
              <span class="question-kicker">The council listens</span>
              <h4 data-question-title>Choose a cat token</h4>
              <p data-question-text>Each gentle answer brings Sura closer to the chair that was waiting.</p>
              <div class="answer-row">
                ${data.answerChoices.map((choice) => `
                  <button type="button" class="secondary-button tap-target" data-answer-choice>${escapeHtml(choice)}</button>
                `).join("")}
              </div>
              <p class="question-response" data-question-response></p>
            </aside>
          </div>

          <div class="chapter-final-message" data-final-panel hidden>
            <p>${escapeHtml(data.finalMessages.decision)}</p>
            <strong>${escapeHtml(data.finalMessages.welcome)}</strong>
            <span>${escapeHtml(data.finalMessages.cta)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderStoryPanel(panel, index, config) {
    const imagePath = config.imagePaths[panel.imageKey] || "";
    return `
      <figure class="story-panel ${index === 0 ? "is-active" : ""}" data-story-panel="${index}" data-panel-id="${escapeAttribute(panel.id)}">
        <img src="${escapeAttribute(imagePath)}" alt="${escapeAttribute(panel.alt)}" loading="${index === 0 ? "eager" : "lazy"}">
        <span class="painted-wash" aria-hidden="true"></span>
      </figure>
    `;
  }

  function renderCatChair(cat, index) {
    const position = CHAIR_POSITIONS[index];
    return `
      <div class="council-chair is-occupied chair-${escapeAttribute(cat.id)}" style="--chair-x: ${position.x}%; --chair-y: ${position.y}%;">
        <button class="cat-token tap-target" type="button" data-cat-token="${escapeAttribute(cat.id)}" aria-pressed="false" aria-label="${escapeAttribute(cat.title)}">
          <span class="cat-token-art" aria-hidden="true">${getCatTokenSvg(index)}</span>
          <span class="cat-token-label">${escapeHtml(cat.quality)}</span>
        </button>
      </div>
    `;
  }

  function renderEmptyChair(data) {
    return `
      <div class="council-chair is-empty seventh-chair" style="--chair-x: ${EMPTY_CHAIR_POSITION.x}%; --chair-y: ${EMPTY_CHAIR_POSITION.y}%;" aria-label="${escapeAttribute(data.chairLore)}">
        <span class="empty-chair-glow" aria-hidden="true"></span>
        <span class="empty-chair-label">Seventh Chair</span>
      </div>
    `;
  }

  function renderFloaters(count) {
    return Array.from({ length: count }, (_, index) => {
      const kind = index % 3 === 0 ? "petal" : "sparkle";
      return `<span class="chapter-floater ${kind}" style="--float-left: ${5 + ((index * 17) % 90)}%; --float-top: ${4 + ((index * 23) % 86)}%; --float-delay: ${index * -0.7}s;"></span>`;
    }).join("");
  }

  function setupEntry(data, config, state, refs, reducedMotion) {
    refs.enterButton.addEventListener("click", async () => {
      if (state.entered) return;

      state.entered = true;
      refs.enterButton.setAttribute("aria-pressed", "true");
      refs.enterButton.classList.add("is-entered");
      refs.musicToggle.disabled = false;
      await playTheme(state, refs);

      if (!reducedMotion.matches) {
        startPanelTimer(data, config, state, refs);
      }
    });
  }

  function setupAudio(state, refs, config) {
    state.audio = new Audio(config.musicPath);
    state.audio.loop = true;
    state.audio.preload = "none";

    refs.musicToggle.addEventListener("click", async () => {
      if (!state.entered || !state.themeAvailable) return;

      if (state.audio.paused) {
        await playTheme(state, refs);
        return;
      }

      state.audio.muted = !state.audio.muted;
      refs.musicToggle.textContent = state.audio.muted ? "Unmute" : "Mute";
      refs.musicToggle.setAttribute("aria-pressed", state.audio.muted ? "true" : "false");
    });

    state.audio.addEventListener("error", () => {
      state.themeAvailable = false;
      refs.musicToggle.textContent = "Theme unavailable";
      refs.musicToggle.setAttribute("aria-pressed", "false");
    });
  }

  async function playTheme(state, refs) {
    if (!state.audio || !state.themeAvailable) return;

    try {
      state.audio.muted = false;
      await state.audio.play();
      refs.musicToggle.textContent = "Mute";
      refs.musicToggle.setAttribute("aria-pressed", "false");
    } catch (error) {
      state.themeAvailable = false;
      refs.musicToggle.textContent = "Theme unavailable";
      refs.musicToggle.setAttribute("aria-pressed", "false");
    }
  }

  function setupPanelNavigation(data, config, state, refs, reducedMotion) {
    refs.navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.panelNav);
        activatePanel(index, data, state, refs);

        if (state.entered && !reducedMotion.matches) {
          startPanelTimer(data, config, state, refs);
        }
      });
    });

    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches) {
          stopPanelTimer(state);
          resetParallax(refs.story);
          resetParallax(refs.councilStage);
          return;
        }

        if (state.entered) startPanelTimer(data, config, state, refs);
      });
    }
  }

  function startPanelTimer(data, config, state, refs) {
    stopPanelTimer(state);
    state.panelTimer = window.setInterval(() => {
      const nextPanel = (state.currentPanel + 1) % data.storyPanels.length;
      activatePanel(nextPanel, data, state, refs);
    }, config.panelFadeMs);
  }

  function stopPanelTimer(state) {
    if (state.panelTimer) {
      window.clearInterval(state.panelTimer);
      state.panelTimer = null;
    }
  }

  function activatePanel(index, data, state, refs) {
    const panel = data.storyPanels[index];
    if (!panel) return;

    state.currentPanel = index;
    refs.panels.forEach((element, panelIndex) => {
      element.classList.toggle("is-active", panelIndex === index);
    });
    refs.navButtons.forEach((button, buttonIndex) => {
      button.setAttribute("aria-selected", buttonIndex === index ? "true" : "false");
    });

    refs.storyCopy.classList.remove("is-revealed");
    refs.panelCount.textContent = `${index + 1} / ${data.storyPanels.length}`;
    refs.panelTitle.textContent = panel.title;
    refs.panelText.textContent = panel.text;
    window.requestAnimationFrame(() => refs.storyCopy.classList.add("is-revealed"));
  }

  function setupCatGame(data, cats, state, refs) {
    let activeCat = null;

    refs.catButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const cat = cats.find((item) => item.id === button.dataset.catToken);
        if (!cat) return;

        activeCat = cat;
        state.visitedCats.add(cat.id);
        button.classList.add("is-visited");
        button.setAttribute("aria-pressed", "true");

        refs.questionPanel.classList.add("is-active");
        refs.questionTitle.textContent = cat.shortName;
        refs.questionText.textContent = cat.question;
        refs.responseText.textContent = cat.response;

        updateProgress(cats.length, state, refs);
        if (state.visitedCats.size === cats.length) unlockSeventhChair(data, refs);
      });
    });

    refs.answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!activeCat) return;
        refs.responseText.textContent = activeCat.response;
      });
    });
  }

  function updateProgress(total, state, refs) {
    refs.progressText.textContent = `${state.visitedCats.size} / ${total} council cats have welcomed Sura`;
  }

  function unlockSeventhChair(data, refs) {
    refs.councilStage.classList.add("is-unlocked");
    refs.finalPanel.hidden = false;
    refs.finalPanel.classList.add("is-visible");
  }

  function setupImageFallbacks(panels) {
    panels.forEach((panel) => {
      const image = panel.querySelector("img");
      if (!image) return;

      const showFallback = () => {
        image.hidden = true;
        panel.classList.add("has-missing-image");
      };

      image.addEventListener("error", showFallback);
      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  function setupParallax(root, refs, reducedMotion) {
    [refs.story, refs.councilStage].forEach((area) => {
      if (!area) return;

      area.addEventListener("pointermove", (event) => {
        if (reducedMotion.matches) return;
        const rect = area.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
        area.style.setProperty("--parallax-x", `${x}px`);
        area.style.setProperty("--parallax-y", `${y}px`);
      });

      area.addEventListener("pointerleave", () => resetParallax(area));
      area.addEventListener("pointercancel", () => resetParallax(area));
    });
  }

  function resetParallax(area) {
    if (!area) return;
    area.style.setProperty("--parallax-x", "0px");
    area.style.setProperty("--parallax-y", "0px");
  }

  function setupPawTrail(root, reducedMotion) {
    root.addEventListener("pointerdown", (event) => {
      if (reducedMotion.matches) return;

      for (let index = 0; index < 4; index += 1) {
        const paw = document.createElement("span");
        paw.className = "paw-trail";
        paw.style.left = `${event.clientX + index * 8 - 12}px`;
        paw.style.top = `${event.clientY + index * -5 - 8}px`;
        paw.style.animationDelay = `${index * 45}ms`;
        document.body.appendChild(paw);
        window.setTimeout(() => paw.remove(), 980 + index * 45);
      }
    });
  }

  function applyTheme(root, colors) {
    Object.entries(colors || {}).forEach(([name, value]) => {
      root.style.setProperty(`--chapter-${name}`, value);
    });
  }

  function getCatTokenSvg(index) {
    const palettes = [
      ["#fff1d8", "#d96d8f"],
      ["#f2edff", "#7864bc"],
      ["#fff7e8", "#d9ad55"],
      ["#ffe8ef", "#b46c89"],
      ["#ede7ff", "#8f78ce"],
      ["#fff2c9", "#c2933f"]
    ];
    const palette = palettes[index % palettes.length];
    const fur = palette[0];
    const accent = palette[1];

    return `
      <svg viewBox="0 0 96 96" role="img" aria-label="Council cat token">
        <path d="M22 50 L29 22 L44 38 L53 38 L68 22 L75 50 C80 72 62 82 48 82 C34 82 16 72 22 50Z" fill="${fur}" stroke="#5e4a59" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="39" cy="53" r="3.5" fill="#352c38"/>
        <circle cx="57" cy="53" r="3.5" fill="#352c38"/>
        <path d="M46 62 Q48 65 50 62" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <path d="M37 68 Q48 76 59 68" fill="none" stroke="#352c38" stroke-width="3" stroke-linecap="round"/>
        <path d="M31 60 H17 M32 66 H19 M65 60 H79 M64 66 H77" stroke="#a5798c" stroke-width="2" stroke-linecap="round"/>
        <circle cx="69" cy="37" r="7" fill="${accent}" opacity="0.78"/>
      </svg>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  window.ChapterTwo = { mount };
})();
