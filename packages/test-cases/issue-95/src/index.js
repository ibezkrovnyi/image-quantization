import tap from 'tap';

const bugURL = 'https://github.com/ibezkrovnyi/image-quantization/issues/95';

const success = async () => {
  const message = `Make sure bug is fixed in workspace version of image-q (see ${bugURL} for details)`;
  const iq = await import('image-q');
  const distance = new iq.distance.Euclidean();
  tap.not(distance._kR, undefined, message);
  tap.not(distance._kG, undefined, message);
  tap.not(distance._kB, undefined, message);
  tap.not(distance._kA, undefined, message);
};

const fail = async () => {
  const message = `Reproduce bug in image-q@3.0.5 (see ${bugURL} for details)`;

  const iq = await import('image-q-bad');
  const distance = new iq.distance.Euclidean();
  tap.equal(distance._kR, undefined, message);
  tap.equal(distance._kG, undefined, message);
  tap.equal(distance._kB, undefined, message);
  tap.equal(distance._kA, undefined, message);
};

success();
fail();
