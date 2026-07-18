CREATE TABLE IF NOT EXISTS services (
    serviceID INT NOT NULL AUTO_INCREMENT,
    serviceName VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('Available', 'Unavailable')
        NOT NULL DEFAULT 'Available',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (serviceID),
    UNIQUE KEY uq_services_name (serviceName),

    CONSTRAINT chk_services_duration
        CHECK (duration > 0),

    CONSTRAINT chk_services_price
        CHECK (price >= 0)
);
CREATE TABLE IF NOT EXISTS staff (
    staffID INT NOT NULL AUTO_INCREMENT,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    availabilityStatus ENUM('Available', 'Unavailable')
        NOT NULL DEFAULT 'Available',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (staffID),
    UNIQUE KEY uq_staff_email (email)
);
CREATE TABLE IF NOT EXISTS Users (
    userID INT NOT NULL AUTO_INCREMENT,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('Customer', 'Admin') NOT NULL DEFAULT 'Customer',
    accountStatus ENUM('Active', 'Inactive', 'Blocked') NOT NULL DEFAULT 'Active',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (userID),
    UNIQUE KEY uq_users_email (email)
);
CREATE TABLE IF NOT EXISTS appointments (
    appointmentID INT NOT NULL AUTO_INCREMENT,
    userID INT NOT NULL,
    serviceID INT NOT NULL,
    staffID INT NULL,
    appointmentDate DATE NOT NULL,
    appointmentTime TIME NOT NULL,
    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Pending',
    remarks VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (appointmentID),

    KEY idx_appointments_user (userID),
    KEY idx_appointments_service (serviceID),
    KEY idx_appointments_staff (staffID),
    KEY idx_appointments_date_status (
        appointmentDate,
        status
    ),

    CONSTRAINT fk_appointments_user
        FOREIGN KEY (userID)
        REFERENCES Users(userID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_service
        FOREIGN KEY (serviceID)
        REFERENCES services(serviceID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_staff
        FOREIGN KEY (staffID)
        REFERENCES staff(staffID)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS queue (
    queueID INT NOT NULL AUTO_INCREMENT,
    appointmentID INT NOT NULL,
    queueNumber INT NOT NULL,
    queueStatus ENUM(
        'Waiting',
        'Serving',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Waiting',
    checkInTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    calledTime DATETIME NULL,
    completedTime DATETIME NULL,

    PRIMARY KEY (queueID),

    UNIQUE KEY uq_queue_appointment (appointmentID),

    KEY idx_queue_number (queueNumber),
    KEY idx_queue_status (queueStatus),
    KEY idx_queue_checkin (checkInTime),

    CONSTRAINT fk_queue_appointment
        FOREIGN KEY (appointmentID)
        REFERENCES appointments(appointmentID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS feedback (
    feedbackID INT NOT NULL AUTO_INCREMENT,
    appointmentID INT NOT NULL,
    userID INT NOT NULL,
    rating INT NOT NULL,
    comments VARCHAR(500),
    submittedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (feedbackID),

    UNIQUE KEY uq_feedback_appointment (appointmentID),

    KEY idx_feedback_user (userID),
    KEY idx_feedback_rating (rating),
    KEY idx_feedback_date (submittedDate),

    CONSTRAINT chk_feedback_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_feedback_appointment
        FOREIGN KEY (appointmentID)
        REFERENCES appointments(appointmentID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_feedback_user
        FOREIGN KEY (userID)
        REFERENCES Users(userID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);