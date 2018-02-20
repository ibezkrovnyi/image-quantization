/**
 * Original implementation: https://github.com/marcin-chwedczuk/hilbert_curve/blob/2be1a0eb3b269d3114a8c999289006fecdb54089/js/main.js
 * Original algorithm description: https://marcin-chwedczuk.github.io/iterative-algorithm-for-drawing-hilbert-curve
 * Converted to TypeScript
 */
const positions = [
  /* 0: */[0, 0],
  /* 1: */[0, 1],
  /* 2: */[1, 1],
  /* 3: */[1, 0],
];

/* N - size of hilbert curve,
 * N must be power of 2;
 *
 * hindex - number between 0..(N*N-1)
 *
 * returns [x, y]
 */
export function hindex2xy(hindex: number, N: number) {
  let [x, y] = positions[hindex % 4];
  hindex = Math.floor(hindex / 4);
  for (let n = 4; n <= N; n *= 2) {
    const n2 = n / 2;

    switch (hindex % 4) {
      case 0: /* left-bottom */
        [x, y] = [y, x];
        break;

      case 1: /* left-upper */
        x = x;
        y += n2;
        break;

      case 2: /* right-upper */
        x += n2;
        y += n2;
        break;

      case 3: /* right-bottom */
        [y, x] = [n2 - 1 - x, n2 - 1 - y];
        x += n2;
        break;
    }

    hindex = Math.floor(hindex / 4);
  }

  return [x, y];
}

function demo(w: number, h: number) {
  const max = Math.max(w, h);
  const N = Math.pow(2, Math.ceil(Math.log2(max)));

  // console.log('init hilbert: ', w, h, max, N);
  for (let hindex = 0; hindex < N * N; hindex++) {
    const [x, y] = hindex2xy(hindex, N);
    if (x < w && y < h) {
      // console.log(hindex, x, y);
    }
  }
  // console.log('end hilbert');
}

// demo(4, 4);
