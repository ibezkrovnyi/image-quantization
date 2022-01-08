import tap from 'tap';
import iq from 'image-q';

tap.equal(iq, undefined, 'static import default - there is no default export in image-q');
