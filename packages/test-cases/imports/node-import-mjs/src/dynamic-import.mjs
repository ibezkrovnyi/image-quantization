import tap from 'tap';

const run = async () => {
  const iq = await import('image-q');
  tap.not(iq.distance.Euclidean, undefined, 'dynamic import');
};

run();
