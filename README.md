# El Secreto de la Causa Piurana

Videojuego educativo en HTML5 sobre la tradición culinaria de Piura, Perú. Prensa las papas, atrapa los ingredientes correctos y descubre el secreto de la causa piurana.

## Cómo ejecutar

No requiere npm ni bundler. JavaScript vanilla; Firebase se carga desde CDN.

### Opción 1 — Abrir directamente

Abre `index.html` en Chrome, Firefox, Edge o Safari.

> Para el ranking online con Google Sign-in, usa un servidor local (los popups de OAuth suelen fallar con `file://`).

### Opción 2 — Servidor local (recomendado)

```bash
cd game-scp
python3 -m http.server 8080
```

Visita: [http://localhost:8080](http://localhost:8080)

### Requisitos

- Navegador moderno con Canvas 2D, `localStorage` y (opcional) Web Audio API.
- Escritorio, tablet y móvil (orientación vertical y horizontal).

### Solución de problemas

| Problema | Causa / solución |
|----------|------------------|
| Canvas negro al pulsar **Jugar** | El motor espera a que el área de juego sea visible (`whenCanvasReady` en `game.js`). |
| Sin sonido | Web Audio requiere interacción previa. Pulsa **Jugar** o cualquier botón. |
| Récords no guardados | Comprueba que `localStorage` no esté bloqueado (modo privado estricto). |
| Progreso perdido al rotar | Las escenas usan `onResize()` sin reiniciar el nivel. |
| Ranking global vacío o error | Inicia sesión con Google; verifica Firestore en la consola Firebase. |
| Popup de Google bloqueado | Permite ventanas emergentes o usa `http://localhost`. |

---

## Estructura del proyecto

```
game-scp/
├── index.html              # Menú, juego, ranking y modales
├── styles.css              # UI responsive (paleta peruana)
├── firebase.json           # Configuración Firebase
├── firestore.rules         # Reglas de seguridad (colección scores)
├── .firebaserc             # Proyecto por defecto: game-scp
├── README.md
└── js/
    ├── game.js             # Motor: estados, bucle, input, resize
    ├── ui.js               # Pantallas, HUD, ranking, modales
    ├── home.js             # Fondo animado del menú
    ├── touch-controls.js   # Controles táctiles móvil/tablet
    ├── scene1.js           # Nivel 1: Prensa de papas
    ├── scene2.js           # Nivel 2: Atrapa ingredientes
    ├── ingredients.js      # Sprites Canvas (sin imágenes)
    ├── canvas-utils.js     # Resize, partículas, temporizador
    ├── audio.js            # Efectos Web Audio (sin archivos)
    ├── storage.js          # Récords locales (localStorage)
    ├── firebase-config.js  # Credenciales del proyecto
    ├── firebase-utils.js   # Validación y timestamps
    ├── firebase-core.js    # Init App + Auth + Firestore
    ├── firebase-auth.js    # Google Sign-in
    └── leaderboard.js      # submitScore, fetchTopScores
```

### Orden de carga de scripts

```
Firebase CDN
  → audio → canvas-utils → ingredients → storage
  → firebase-config → firebase-utils → firebase-core → firebase-auth → leaderboard
  → home → touch-controls → ui → scene1 → scene2 → game
```

### Flujo del juego

```
Menú (home.js)
  → Jugar → Nivel 1 (scene1.js)
  → Transición → Nivel 2 (scene2.js)
  → Victoria (récord local + envío opcional al ranking) o Derrota
  → Jugar nuevamente → Menú

Menú → Ranking → pantalla leaderboard (global / local) → Volver
```

### Estados del motor (`game.js`)

| Estado | Descripción |
|--------|-------------|
| `menu` | Pantalla principal |
| `playing` | Nivel activo en el canvas |
| `transition` | Entre nivel 1 y nivel 2 |
| `defeat` | Tiempo agotado o meta no alcanzada |
| `victory` | Partida completada |

---

## Controles

### Menú principal

| Acción | Escritorio | Móvil / tablet |
|--------|------------|----------------|
| Jugar, Ranking, Créditos | Clic | Tocar botones |

### Pantalla Ranking

| Acción | Escritorio | Móvil / tablet |
|--------|------------|----------------|
| Cambiar pestaña Global / Local | Clic | Tocar pestaña |
| Volver al menú | Clic en **Volver** | Tocar **Volver** |
| Cerrar | `Escape` | — |

### Nivel 1 — La Prensa de Papas

| Acción | Escritorio | Móvil / tablet |
|--------|------------|----------------|
| Prensar | `ESPACIO` repetidamente | Tocar canvas o botón **Prensar** |

### Nivel 2 — Atrapa los Ingredientes

| Acción | Escritorio | Móvil / tablet |
|--------|------------|----------------|
| Mover bandeja | `←` `→` | Botones ◀ ▶ (mantener) |
| Posicionar bandeja | Clic y arrastrar | Tocar y deslizar en el canvas |

### General

- `Escape` — cierra modales y la pantalla Ranking.
- Controles táctiles automáticos en pantallas ≤ 1024 px o con puntero táctil.

---

## Reglas del juego

### Objetivo general

Completa los dos niveles para revelar el secreto de la causa piurana y conseguir la mejor puntuación.

### Nivel 1 — La Prensa de Papas

| Regla | Detalle |
|-------|---------|
| Meta | **100 %** de progreso |
| Tiempo | **20 segundos** |
| Acción | Cada pulsación suma **+5 %** |
| Victoria | 100 % antes de que acabe el tiempo |
| Derrota | Tiempo agotado sin completar |
| Puntaje | **+50** base + **+5** por cada segundo restante |

### Transición

Al completar el Nivel 1: **«¡Las papas están listas!»** con el puntaje acumulado. Pulsa **Continuar** para el Nivel 2.

### Nivel 2 — Atrapa los Ingredientes

| Regla | Detalle |
|-------|---------|
| Meta | **≥ 100 puntos** de nivel |
| Tiempo | **60 segundos** |
| Correctos (**+10**) | Papa, limón, huevo, aceituna |
| Incorrectos (**−5**) | Tomate, hamburguesa, pizza, gaseosa |
| Dificultad | Cada **15 s** sube una fase (4 fases) |
| Victoria | ≥ 100 pts al terminar el tiempo |
| Derrota | < 100 pts al terminar (reintentar nivel) |

### Pantalla final

| Estrellas | Puntaje total |
|-----------|---------------|
| ★★★ | 150+ |
| ★★ | 120+ |
| ★ | 100+ |

- Récord local: top **10** en `localStorage`.
- Ranking global: top **20** en Firestore (requiere Google Sign-in).

---

## Ranking online (Firebase)

Proyecto: **game-scp** · App Web: **El Secreto de la Causa Piurana**

### Desplegar en Firebase Hosting

Requisitos: [Firebase CLI](https://firebase.google.com/docs/cli) instalada y sesión iniciada (`firebase login`).

```bash
cd game-scp
firebase deploy --project game-scp
```

Esto publica la web en **https://game-scp.web.app** y despliega las reglas de Firestore.

Solo hosting o solo reglas:

```bash
firebase deploy --only hosting --project game-scp
firebase deploy --only firestore:rules --project game-scp
```

### Configuración en consola (una vez)

1. [Firebase Console](https://console.firebase.google.com/project/game-scp) → **Authentication** → **Sign-in method** → activar **Google**.
2. Tras el primer deploy, `game-scp.web.app` y `game-scp.firebaseapp.com` se añaden solos a **Authorized domains**. Si usas dominio propio, añádelo ahí.
3. Credenciales en `js/firebase-config.js` (plantilla en `firebase-config.example.js`).

### Pantalla Ranking

- Tarjeta con columnas: **Posición**, **Jugador**, **Puntaje**, **Fecha**.
- Medallas 🥇 🥈 🥉 para el top 3.
- Pestañas **Global** (Firestore) y **Local** (`localStorage`).
- Animación de entrada y botón **Volver**.

### API

```javascript
await FirebaseCore.init();
await FirebaseAuth.signInWithGoogle();
await Leaderboard.submitScore(undefined, 150);
const top20 = await Leaderboard.fetchTopScores();
```

---

## Notas de rendimiento

| Técnica | Archivo | Efecto |
|---------|---------|--------|
| `beginFrame()` cada frame | `canvas-utils.js` | Evita acumulación de `scale()` |
| `syncCanvasSize()` solo en resize | `canvas-utils.js` | No redimensiona bitmap en cada frame |
| `capDelta(50 ms)` | `canvas-utils.js` | Evita saltos al recuperar foco |
| Bucle idle en menú | `game.js` | No dibuja si no hay partida activa |
| HUD condicional | `scene1.js`, `scene2.js` | Actualiza DOM solo si cambia el estado |
| Tope de objetos en pantalla | `scene2.js` | Máx. 12 ítems cayendo |
| `HomeBG.stop()` al jugar | `home.js` | Detiene animación del menú |

---

## Auditoría del código

| Hallazgo | Estado |
|----------|--------|
| Sintaxis JS (`node --check`) | Sin errores en `js/*.js` |
| Variable `listener` sin uso | Corregido en `firebase-auth.js` |
| Sanitización/timestamps duplicados | Centralizado en `firebase-utils.js` |
| Paneles auth duplicados | `AUTH_SLOTS` en `ui.js` |
| Tabla ranking duplicada | `renderLeaderboardTable()` |
| Inits Firebase redundantes | `ensureLeaderboardReady()` |
| `err.code` sin optional chaining | `err?.code` en sign-in |
| Shadowing de `score` en tabla | Renombrado a `scoreCell` |
| CSS obsoleto (modal récords) | Eliminado (~120 líneas) |
| Game loop en menú | Optimizado: solo dibuja si hay partida |

---

## Tecnologías

- HTML5 Canvas 2D
- JavaScript vanilla (IIFE, ES6+)
- CSS3 responsive
- Web Audio API
- `localStorage` (récords locales)
- Firebase Auth + Firestore (ranking global)

## Licencia

Proyecto educativo de código abierto.
