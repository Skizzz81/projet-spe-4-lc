import { useEffect, useState } from 'react';
import * as documentApi from '../api/documentApi.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    documentApi
      .listDocuments()
      .then((data) => setDocuments(data.documents))
      .catch(console.error);
  }, []);

  async function createDocument(title) {
    const data = await documentApi.createDocument(title);
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

  async function deleteDocument(documentId) {
    await documentApi.deleteDocument(documentId);
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId),
    );
  }

  function inviteDocumentMember(documentId, email) {
    return documentApi.inviteDocumentMember(documentId, email);
  }

  return {
    documents,
    createDocument,
    updateDocumentContent,
    deleteDocument,
    inviteDocumentMember,
  };
}
