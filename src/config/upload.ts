import path from 'path';

import multer from 'multer';

const testFolder = path.resolve(__dirname, '..', '__tests__');

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: testFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
  }),
};
