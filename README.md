# El Secreto de la Causa Piurana

Videojuego educativo en HTML5 sobre la tradición culinaria de Piura, Perú. Prepara la base de la causa piurana y atrapa los ingredientes correctos para completar la receta.

## Cómo ejecutar

No requiere instalación ni dependencias. Solo un navegador moderno.

### Opción 1 — Abrir directamente

Abre `index.html` en Chrome, Firefox, Edge o Safari.

### Opción 2 — Servidor local (recomendado)

```bash
cd game-scp
python3 -m http.server 8080
```

Luego visita: [http://localhost:8080](http://localhost:8080)

## Estructura del proyecto

```
game-scp/
├── index.html          # Página principal y pantallas de UI
├── styles.css          # Estilos responsive estilo videojuego casual
├── README.md
└── js/
    ├── game.js         # Motor: estados, bucle de juego, input
    ├── ui.js           # Menú principal, modales, puntaje y HUD
    ├── home.js         # Fondo animado de la pantalla de inicio
    ├── storage.js      # Mejor puntaje y tabla de récords (localStorage)
    ├── scene1.js       # Nivel 1: Prensa de papas
    ├── scene2.js       # Nivel 2: Atrapa ingredientes
    ├── ingredients.js  # Dibujo Canvas de ingredientes
    ├── canvas-utils.js # Utilidades compartidas (roundRect, clamp, delta)
    └── audio.js        # Efectos de sonido (Web Audio API)
```

## Pantalla principal

Al abrir el juego verás el menú con:

- Logo **El Secreto de la Causa Piurana**
- Fondo animado con ingredientes flotantes (papa, limón, aceituna, huevo)
- **Mejor puntaje** histórico guardado en tu navegador
- **Jugar** — inicia la aventura
- **Tabla de récords** — últimas 10 partidas con estrellas
- **Créditos** — información del proyecto

## Controles

| Contexto | Escritorio | Móvil / táctil |
|----------|------------|----------------|
| Menú principal | Clic en botones | Tocar botones |
| Nivel 1 — Prensa | `ESPACIO` repetidamente | Tocar el canvas |
| Nivel 2 — Bandeja | `←` `→` o arrastrar con clic sostenido | Tocar y deslizar en el canvas |

## Reglas del juego

### Objetivo general

Completa los dos niveles para descubrir el secreto de la causa piurana y obtener la mejor puntuación posible.

### Nivel 1 — La Prensa de Papas

- **Meta:** Llegar al 100 % de progreso prensando las papas.
- **Tiempo:** 20 segundos.
- **Control:** Presiona `ESPACIO` o toca la pantalla en cada pulsación (+5 % por pulsación).
- **Victoria:** Completar el 100 % antes de que acabe el tiempo.
- **Puntaje:** +50 puntos base + bonus por cada segundo restante (×5).

### Transición

Al completar el Nivel 1 aparece la pantalla **"¡Las papas están listas!"** con el puntaje acumulado. Pulsa **Continuar** para el Nivel 2.

### Nivel 2 — Atrapa los Ingredientes

- **Meta:** Alcanzar **100 puntos de nivel** antes de que termine el tiempo.
- **Tiempo:** 60 segundos.
- **Ingredientes correctos (+10):** papa, limón, huevo, aceituna.
- **Ingredientes incorrectos (−5):** tomate, hamburguesa, pizza, gaseosa.
- **Dificultad:** Cada 15 segundos aumenta la velocidad de caída y la cantidad de ingredientes (4 fases).
- **Victoria:** Tener ≥ 100 puntos de nivel al acabar el tiempo.
- **Derrota:** Menos de 100 puntos de nivel al acabar el tiempo (puedes reintentar).

### Pantalla final

Si superas el juego con al menos 100 puntos totales:

| Estrellas | Puntaje total |
|-----------|---------------|
| ★★★ | 150+ |
| ★★ | 120+ |
| ★ | 100+ |

Se muestra el puntaje final, el tiempo restante del Nivel 2 y las estrellas de desempeño.

## Tecnologías

- HTML5 Canvas
- JavaScript vanilla (sin frameworks)
- CSS3 con diseño responsive
- Web Audio API para sonidos opcionales

## Licencia

Proyecto educativo de código abierto.
