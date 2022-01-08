import tap from 'tap';
import { distance } from 'image-q';

tap.not(distance.Euclidean, undefined, 'static import of named export');
