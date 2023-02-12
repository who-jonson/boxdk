import Rusha from 'rusha';
import CheckForFileReader from './check-for-file-reader';

export default (blob: Blob) => {
  return new Promise((resolve, reject) => {
    if (!CheckForFileReader()) {
      reject(new Error('FileReader isn\'t usable in this browser.'));
    }
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (!evt || !evt.target || !evt.target.result) {
          reject(new Error('Unknown Event'));
          return;
        }
        const rusha = Rusha.createHash();

        resolve(rusha.update(evt.target.result).digest('hex'));
      };
      reader.readAsArrayBuffer(blob);
    } catch (e) {
      reject(e);
    }
  });
};
