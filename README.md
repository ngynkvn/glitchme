# Glitchme

A browser-based pixel sorting editor. Sort pixels into streaks, adjust the effect, and export a PNG.

**[Open the app →](https://ngynkvn.github.io/glitchme/)**

## Use

1. Open, drop, or paste an image, or use the included Alpine demo.
2. Choose Drift, Signal, Spectral, or Oil slick. **Randomize** generates new settings.
3. Adjust direction, sort order, brightness window, streak length, intensity, RGB split, and Kuwahara smoothing.
4. Check the selection mask or use Compare to view the original beside the result.
5. Export a PNG.

Each edit starts from the original. Reset restores the default effect. Sliders support arrow keys and the mouse wheel when focused.

## Image limits and privacy

- Processing runs locally in a Web Worker. Images are never uploaded.
- Max file size: 25 MB.
- Images larger than 1600 px on the longest edge are resized. Exports use the preview dimensions.
- Animated images use one frame.
- Supported formats depend on the browser, including PNG, JPEG, WebP, AVIF, and SVG.

The demo illustration is original. Bundled DM Sans and Space Grotesk fonts include SIL Open Font Licenses in `public/fonts/`.

## Development

Use Node.js 24 (`nvm use`) and npm:

```sh
npm ci
npm run dev
```

Open the displayed local URL at `/glitchme/`.

```sh
npm run check        # lint, formatting, processing regression tests, production build
npx playwright install chromium firefox
npm run test:e2e     # production-bundle tests in Chromium, Firefox, and mobile Chromium
npm run preview     # serve dist locally
```

`npm run format` applies the shared Prettier style. `npm run test:watch` runs unit tests during development. Browser tests write screenshots and failure traces to the ignored `test-results/` directory. To test an existing deployment, set `BASE_URL=https://ngynkvn.github.io/glitchme/` when running browser tests.

## Structure

- `src/processor.ts`, `src/util.ts`, `src/filter/`: deterministic pixel operations and alpha handling.
- `src/processor.worker.ts`, `src/hooks/useProcessor.ts`: processing lifecycle, debouncing, cancellation, and stale-result protection.
- `src/image.ts`, `src/hooks/useImage.ts`: decoding, input validation, resizing, paste, export, and load-race protection.
- `src/components/`: controls, sliders, canvas preview, and comparison.
- `tests/`: algorithm regressions and end-to-end editor flows.
- `public/demo.svg`: original demo illustration; `public/favicon.svg`: app icon.

GitHub Actions runs lint, unit tests, a production build, and browser tests on pull requests and pushes to `main`. A successful `main` run deploys the checked bundle to GitHub Pages. Keep `base: '/glitchme/'` in `vite.config.ts` aligned with the repository name.
