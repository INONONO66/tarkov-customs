# Build sources for customs.html

`customs.html` (in the parent directory) is the whole game in one file. It is produced by
concatenating the chunks in this directory:

    ./build/make.sh

Headless checks (need Playwright + Chromium: `npm i playwright` inside `build/`):

    node build/test.mjs    # deterministic gameplay test-suite (menu, modding, raid loop, AI, extraction, death)
    node build/shots.mjs   # renders /tmp/s_*.png screenshots of a few scenes
