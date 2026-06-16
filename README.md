# Chess the Move

A progressive web app that trains your chess intuition by challenging you to guess the next move played in famous and live grandmaster games. Powered by Stockfish 18 for move evaluation.

## How it works

1. A middlegame position from a real game is displayed.
2. Make your move — drag or click to move a piece.
3. Stockfish evaluates your move against the GM's choice and its own top-3 candidates.
4. Points are awarded based on move quality, with streak bonuses for consecutive good moves.

## Scoring

| Move | Points |
|------|--------|
| Engine #1 | +3 |
| Engine #2 + GM match | +3 |
| Engine #2 only | +2 |
| Engine #3 + GM match | +2 |
| Engine #3 only | +1 |
| GM move (not top-3) | +1 |
| Off-book but better than GM eval | +1 |
| Off-book | −1 |

Streak bonuses: +1 at 3–5 consecutive scoring moves, +2 at 6+.

## Development

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build (tsc + vite)
npm run test       # vitest unit tests
npm run lint       # eslint
```

## Tech stack

- React 19 + TypeScript, built with Vite
- [chess.js](https://github.com/jhlywa/chess.js) for move validation and SAN conversion
- [react-chessboard](https://github.com/Clariity/react-chessboard) for the board UI
- [Stockfish 18 lite](https://github.com/official-stockfish/Stockfish) (single-threaded WASM) in a Web Worker
- Live positions from the [Lichess API](https://lichess.org/api)
- PWA via vite-plugin-pwa

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
