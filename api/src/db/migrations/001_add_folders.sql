USE projet_spe_4;

CREATE TABLE folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_folders_owner (owner_id),

  CONSTRAINT fk_folders_owner
    FOREIGN KEY (owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

ALTER TABLE documents
  ADD COLUMN folder_id INT NULL AFTER last_modified_by,
  ADD INDEX idx_documents_folder (folder_id),
  ADD CONSTRAINT fk_documents_folder
    FOREIGN KEY (folder_id)
    REFERENCES folders(id)
    ON DELETE SET NULL;
