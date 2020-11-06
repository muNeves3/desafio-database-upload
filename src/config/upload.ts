import path from 'path';

import multer from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '__tests__');

export default {
  directory: tmpFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
  }),
};
