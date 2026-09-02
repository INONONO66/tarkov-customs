#!/bin/sh
cd "$(dirname "$0")/.." && cat build/00_head.html build/01_core.js build/02_weapons.js build/03_world_core.js build/04_world_customs.js build/05_player.js build/06_ai.js build/07_game.js build/08_menu.js > customs.html
