import { useEffect, useState } from 'react';
import * as folderApi from '../api/folderApi.js';

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  useEffect(() => {
    folderApi
      .listFolders()
      .then((data) => setFolders(data.folders))
      .catch(console.error)
      .finally(() => setIsLoadingFolders(false));
  }, []);

  async function createFolder(name) {
    const data = await folderApi.createFolder(name);
    setFolders((currentFolders) => [...currentFolders, data.folder]);
    return data.folder;
  }

  return { folders, isLoadingFolders, createFolder };
}
