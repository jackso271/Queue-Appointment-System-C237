ALTER TABLE users
    ADD COLUMN accountStatus ENUM('Active', 'Inactive', 'Blocked')
    NOT NULL DEFAULT 'Active';