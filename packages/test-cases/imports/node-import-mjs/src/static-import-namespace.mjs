import tap from 'tap';
import * as iq from 'image-q';

tap.not(iq.distance.Euclidean, undefined, 'static import as namespace');
