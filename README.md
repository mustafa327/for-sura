# For Sura Birthday Surprise

## What this project is

This is a complete mobile-first birthday surprise website for Sura. It uses only plain HTML, CSS, and JavaScript, so it works by opening `index.html` directly and is ready for GitHub Pages.

The experience includes a private unlock screen, a 7-wish cat card game, an animated gift reveal, original SVG/CSS cat illustrations, a letter-style message, confetti, soft animations, and an optional music button.

## How to edit the name

Open `script.js` and edit the values near the top:

```js
friendName: "Sura",
senderName: "Mustafa",
unlockAnswer: "sura",
```

The unlock answer is case-insensitive and ignores spaces at the beginning or end.

## How to edit the message

Open `script.js` and change the `mainMessage` text inside `SURPRISE_CONFIG`.

Keep blank lines between paragraphs if you want the letter to stay nicely spaced.

## How to add music

Put your music file here:

```text
music/song.mp3
```

The music does not autoplay. On iPhone Safari and WhatsApp browser, the visitor must tap the music button first. If `music/song.mp3` is missing, the page still works.

To use a different file name, edit this line in `script.js`:

```js
musicPath: "music/song.mp3",
```

## How to test locally

Open `index.html` directly in a browser.

To test the flow:

1. Type `sura` on the lock screen.
2. Tap cat cards until all 7 wishes are collected.
3. Tap `Open the Gift`.
4. Tap the gift box.
5. Tap `Continue`.
6. Scroll through the birthday page.
7. Tap `Replay the Surprise` to restart.

## How to deploy to GitHub Pages

1. Create a public GitHub repository named `for-sura`.
2. Upload all files.
3. Make sure `index.html` is in the root of the repository.
4. Go to `Settings`.
5. Go to `Pages`.
6. Source: `Deploy from a branch`.
7. Branch: `main`.
8. Folder: `/root`.
9. Save.
10. Wait for the GitHub Pages link.
