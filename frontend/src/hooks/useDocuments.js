import { useCallback, useEffect, useState } from 'react';
import * as documentApi from '../api/documentApi.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);

  const refreshDocuments = useCallback(() => {
    return documentApi
      .listDocuments()
      .then((data) => setDocuments(data.documents))
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshDocuments();

    // On recharge la liste quand on revient sur l'onglet : un document
    // partage pendant qu'on etait ailleurs apparait alors tout seul.
    function handleFocus() {
      refreshDocuments();
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshDocuments]);

  async function createDocument(title, folderId = null) {
    const data = await documentApi.createDocument(title, folderId);
    setDocuments((currentDocuments) => [data.document, ...currentDocuments]);
  }

  async function updateDocumentContent(documentId, content) {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, content } : document,
      ),
    );

    try {
      const data = await documentApi.updateDocument(documentId, { content });

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId
            ? {
                ...document,
                updatedAt: data.document.updatedAt,
                lastModifiedBy: data.document.lastModifiedBy,
              }
            : document,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function uploadDocument(title, file, folderId = null) {
    const data = await documentApi.uploadFile(title, file, folderId);
    setDocuments((currentDocuments) => [data.document, ...currentDocuments]);
    return data.document;
  }

  async function replaceDocumentFile(documentId, file) {
    const data = await documentApi.replaceFile(documentId, file);
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              fileName: data.document.fileName,
              fileMime: data.document.fileMime,
              updatedAt: data.document.updatedAt,
              lastModifiedBy: data.document.lastModifiedBy,
            }
          : document,
      ),
    );
    return data.document;
  }

  async function deleteDocument(documentId) {
    await documentApi.deleteDocument(documentId);
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId),
    );
  }

  function inviteDocumentMember(documentId, email, permission) {
    return documentApi.inviteDocumentMember(documentId, email, permission);
  }

  const applyRemoteDocumentContent = useCallback((documentId, content) => {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, content } : document,
      ),
    );
  }, []);

  return {
    documents,
    createDocument,
    uploadDocument,
    replaceDocumentFile,
    updateDocumentContent,
    deleteDocument,
    inviteDocumentMember,
    applyRemoteDocumentContent,
  };
}
