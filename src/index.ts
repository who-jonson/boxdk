import BoxSdk from './boxdk';

const box = new BoxSdk();

const accessToken = import.meta.env.VITE_BOX_APP_TOKEN;

const boxClient = new box.BasicBoxClient({ accessToken });
boxClient.folders.get({ id: '0', params: { fields: 'name,item_collection' } })
  .then((folder: any) => {
    console.log(folder);
  })
  .catch((err: any) => {
    console.log(err);
  });
