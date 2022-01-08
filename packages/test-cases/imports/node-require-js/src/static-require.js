const tap = require('tap');
const iq = require('image-q');

tap.not(iq.distance.Euclidean, undefined, 'static require');
