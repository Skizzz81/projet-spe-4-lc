CREATE DATABASE IF NOT EXISTS projet_spe_4
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projet_spe_4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  two_factor_secret VARCHAR(255) NULL,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (nom, email, password, role)
VALUES (
  'Administrateur',
  'admin@projet.local',
  '$2b$10$KTziFQVCKlBt06nYfOFxP.nzrnRqaubT2AjUywK.NfSrqxRQXuhoi',
  'admin'
);

CREATE TABLE IF NOT EXISTS folders (
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

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  last_modified_by INT NULL,
  folder_id INT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'text',
  file_name VARCHAR(255) NULL,
  file_mime VARCHAR(150) NULL,
  file_data LONGBLOB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_documents_folder (folder_id),

  CONSTRAINT fk_documents_owner
    FOREIGN KEY (owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_documents_last_modifier
    FOREIGN KEY (last_modified_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_documents_folder
    FOREIGN KEY (folder_id)
    REFERENCES folders(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS document_members (
  document_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('viewer', 'editor') NOT NULL DEFAULT 'viewer',
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (document_id, user_id),

  CONSTRAINT fk_document_members_document
    FOREIGN KEY (document_id)
    REFERENCES documents(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_document_members_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
