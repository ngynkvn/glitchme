import { RGBA, getBrightness, getRGBA } from "../util";

// Applies the Kuwahara filter to the image.
export function kuwahara(img: ImageData) {
  const w = img.width;
  const h = img.height;

  const output = new ImageData(w, h);

  const getValues = (quadrant: number[][]) => {
    const [tl, br] = quadrant;
    const rgbs: RGBA[] = [];
    for (let y = tl[1]; y < br[1]; y++) {
      for (let x = tl[0]; x < br[0]; x++) {
        rgbs.push(getRGBA(img, x, y));
      }
    }
    return rgbs;
  };

  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const i = (y * w + x) * 4;
      const quadrant_a = [
        [x - 2, y - 2],
        [x, y],
      ];
      const quadrant_b = [
        [x, y - 2],
        [x + 2, y],
      ];
      const quadrant_c = [
        [x - 2, y],
        [x, y + 2],
      ];
      const quadrant_d = [
        [x, y],
        [x + 2, y + 2],
      ];
      const quadrants = [quadrant_a, quadrant_b, quadrant_c, quadrant_d];

      const stds = [quadrant_a, quadrant_b, quadrant_c, quadrant_d]
        .map(getValues)
        .map((x) => x.map(getBrightness))
        .map(calcStd);
      const argmin = stds.indexOf(Math.min(...stds));
      const quadrant = quadrants[argmin];
      const [r, g, b, a] = rgbAverage(getValues(quadrant));
      output.data[i] = r;
      output.data[i + 1] = g;
      output.data[i + 2] = b;
      output.data[i + 3] = a;
    }
  }
  return output;
}

function rgbAverage(quadrant: RGBA[]): RGBA {
  const [r, g, b, a] = quadrant.reduce(
    ([r, g, b, a], [r2, g2, b2, a2]) => [r + r2, g + g2, b + b2, a + a2],
    [0, 0, 0, 0]
  );
  return [
    r / quadrant.length,
    g / quadrant.length,
    b / quadrant.length,
    a / quadrant.length,
  ];
}

function calcStd(values: number[]) {
  const avg = values.reduce((a, b) => a + b) / values.length;
  const std =
    values.map((v) => Math.pow(v - avg, 2)).reduce((a, b) => a + b) /
    values.length;
  return Math.sqrt(std);
}

onmessage = (msg) => {
  console.log("got msg", msg);
  const [id, data] = msg.data;
  const result = kuwahara(data);
  postMessage([id, result]);
};
