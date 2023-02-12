import Rusha from 'rusha';
import Base64ArrayBuffer from './base64-array-buffer';
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
          reject();
          return;
        }
        const rusha = Rusha.createHash();
        resolve({
          hash: Base64ArrayBuffer(rusha.update(evt.target.result).digest()),
          arrayBuffer: evt.target.result
        });
      };
      reader.readAsArrayBuffer(blob);
    } catch (e) {
      reject(e);
    }
  });
};
