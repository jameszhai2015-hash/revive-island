# 🏝️ Revive Island

**Revive Island** is a relaxing, minimalist pipe-connection puzzle game: rotate
hexagonal blocks to reconnect the broken river and bring water — and life — back
to a parched island.

This project is a modified, Chinese-localized version of
[Drysland](https://github.com/dammafra/drysland) by Francesco Dammacco,
originally the 1st-place entry of the
[Three.js Journey Challenge 017](https://threejs-journey.com/challenges/017-island).
It is adapted to run as an **offline Xiaohongshu mini-tool** inside a
restricted WebView container.

## Features

- 60-second countdown per level; the timer pauses while the game is paused
- Pause / resume / quit game from the in-game menu
- Local progress save (level, board state, remaining time) in `localStorage`
- Procedurally generated levels with a gentle difficulty curve
- Mobile-first UI with notch / safe-area support
- Fully offline: no network requests, all assets bundled

## Setup

```bash
# Install dependencies (only the first time)
npm install

# Run the local dev server at localhost:5173
npm run dev

# Build for production into dist/
npm run build
```

The production build in `dist/` is packaged as an offline zip for the
Xiaohongshu mini-tool container.

## Save System

Progress is saved automatically to browser `localStorage` (key: `state`) when
you play, pause, or quit. From the main menu, **Continue** restores your last
level, board state, and remaining time; **Start New Game** clears the save and
begins from level 1.

## Credits

See the in-game About modal for the full list of assets used. Highlights:

- **Drysland** by Francesco Dammacco (AGPL-3.0) — upstream project
- **Hexagon Kit** & **Cursor Pack** by [Kenney.nl](https://kenney.nl)
- **Wind flow implementation** by [@boytchev](https://github.com/boytchev)
- **Skybox** by [Freestylized](https://freestylized.com/skybox/sky_42/)
- Sound effects via [Pixabay](https://pixabay.com)
- **Low-Poly Seagull** by simonaskLDE (CC BY 4.0) via Sketchfab
- **Sail Ship** by Quaternius and **Sailboat** by Poly by Google (CC BY 3.0)
  via Poly Pizza
- UI font: ZCOOL QingKe HuangYou (free for commercial use)

## License

This project is a derivative of Drysland and is licensed under the
**GNU Affero General Public License v3.0**.
See the [LICENSE](./LICENSE) and [NOTICE](./static/NOTICE.txt) files for details.

© 2025 Francesco Dammacco (original Drysland)
