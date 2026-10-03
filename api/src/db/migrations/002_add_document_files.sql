USE projet_spe_4;

-- Documents non textuels : on peut stocker un fichier (PDF, image, ...) dans un document.
ALTER TABLE documents
  ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'text',
  ADD COLUMN file_name VARCHAR(255) NULL,
  ADD COLUMN file_mime VARCHAR(150) NULL,
  ADD COLUMN file_data LONGBLOB NULL;
