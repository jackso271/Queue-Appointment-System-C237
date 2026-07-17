const serviceDatabase = require('../config/serviceDatabase');

const ServiceManagementModel = {
    getAllServices(callback) {
        const sql = `
            SELECT
                serviceID,
                serviceName,
                description,
                duration,
                price,
                status,
                createdAt
            FROM services
            ORDER BY serviceName ASC
        `;

        serviceDatabase.query(sql, callback);
    },

    getServiceById(serviceID, callback) {
        const sql = `
            SELECT
                serviceID,
                serviceName,
                description,
                duration,
                price,
                status,
                createdAt
            FROM services
            WHERE serviceID = ?
        `;

        serviceDatabase.query(sql, [serviceID], callback);
    },

    createService(serviceData, callback) {
        const sql = `
            INSERT INTO services (
                serviceName,
                description,
                duration,
                price,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            serviceData.serviceName,
            serviceData.description || null,
            serviceData.duration,
            serviceData.price,
            serviceData.status
        ];

        serviceDatabase.query(sql, values, callback);
    },

    updateService(serviceID, serviceData, callback) {
        const sql = `
            UPDATE services
            SET
                serviceName = ?,
                description = ?,
                duration = ?,
                price = ?,
                status = ?
            WHERE serviceID = ?
        `;

        const values = [
            serviceData.serviceName,
            serviceData.description || null,
            serviceData.duration,
            serviceData.price,
            serviceData.status,
            serviceID
        ];

        serviceDatabase.query(sql, values, callback);
    },

    deleteService(serviceID, callback) {
        const sql = `
            DELETE FROM services
            WHERE serviceID = ?
        `;

        serviceDatabase.query(sql, [serviceID], callback);
    }
};

module.exports = ServiceManagementModel;