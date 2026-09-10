# BlockWorld Studio 2.0

A dependency-free browser 3D sandbox inspired by Roblox Studio / Minecraft Creative.

## Run

```bash
npm run dev
```
Then open `http://127.0.0.1:5173`.

No `npm install` is required. There are no external JS/CDN dependencies.

## Controls

### Play
WASD move · Shift run · Space jump · mouse look · wheel zoom · Tab returns to Studio.

### Studio
WASD + right mouse drag camera · wheel zoom · left click select/place · right click delete · R rotate · Q/E move selected vertically · Ctrl+C/V duplicate · Ctrl+Z/Y undo/redo · F focus selection · Delete remove.

## Systems

- Raw WebGL 3D renderer with perspective camera, depth testing, directional light, fog and grid.
- Roblox-like blocky avatar with third-person camera and AABB collisions.
- Studio editor with selection, transform controls, inspector and object palette.
- Templates: Empty, City, Park, Obby, Race, Arena.
- IndexedDB saves plus JSON import/export.
- NPCs, items, coins and simple inventory.
- No CDN / Three.js dependency, so it runs on localhost/offline from the project folder.
