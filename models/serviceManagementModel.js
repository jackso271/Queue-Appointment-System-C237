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
                status
            FROM Services
            ORDER BY serviceName ASC
        `;

        serviceDatabase.query(sql, callback);
    }
};

module.exports = ServiceManagementModel;