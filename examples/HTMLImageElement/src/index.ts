const { utils, applyPalette } = window['image-q'];

const run = async () => {
  const image = document.querySelector('#image') as HTMLImageElement;
  const colors = Array.from({ length: 257}).map(() => [Math.random() * 256 | 0, Math.random() * 256 | 0, Math.random() * 256 | 0]);

  const palette = new utils.Palette();
  palette.add(utils.Point.createByRGBA(0, 0, 0, 0));
  for (let i = 0; i < colors.length; i += 1) {
    const [r, g, b] = colors[i];
    const point = utils.Point.createByRGBA(r, g, b, 255);
    palette.add(point);
  }

  const t = Date.now();
  const inputPointContainer = utils.PointContainer.fromHTMLImageElement(image);
  console.log(`inputPointContainer took ${Date.now() - t}`);

  const outputPointContainer = await applyPalette(
    inputPointContainer,
    palette,
    {
      colorDistanceFormula: 'euclidean',
      imageQuantization: 'nearest',
      onProgress: (_progress) => {
        //print progress somewhere
      },
    },
  );

  console.log(inputPointContainer, outputPointContainer);
  debugger;
};

setTimeout(run, 2000);
