# Glitchme

A pixel sorting playground. Open an image, bend it out of shape, and export a happy accident.

**[Open the app →](https://ngynkvn.github.io/glitchme/)**

## What you can do

- Open, drag in, or paste an image. An original Alpine illustration is included to experiment with immediately.
- Start with Drift, Signal, Spectral, or Oil slick; use **Surprise me** for a fresh combination.
- Sort horizontal or vertical streaks by brightness, hue, or saturation. Adjust the brightness window, streak length, sort intensity, RGB split, and Kuwahara smoothing.
- Switch between the result, original, and selection mask, or drag the comparison divider.
- Export the processed image as a PNG. Edits always start from the original; Reset restores the default effect.

The demo artwork is original. DM Sans and Space Grotesk fonts are bundled locally under their included SIL Open Font Licenses in `public/fonts/`.

Images are processed locally in a cancellable Web Worker and never uploaded. Files up to 25 MB are accepted. Images larger than 1600 px on their longest edge are resized to keep editing responsive, and exports use those displayed dimensions. Animated formats use a single frame. Browser-supported image formats, including PNG, JPEG, WebP, AVIF, and SVG, can be opened. A focused slider supports the mouse wheel; arrow keys work on all sliders.

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
