const staffModel = require('../models/staffModel');

/**
 * Displays the Staff Management page.
 */
async function getAllStaff(req, res) {
    try {
        const { search, position, availabilityStatus } = req.query;

        const staff = await staffModel.getAllStaff(
            search,
            position,
            availabilityStatus
        );

        res.render('staff/index', {
            title: 'Staff Management',
            staff,
            filters: {
                search: search || '',
                position: position || '',
                availabilityStatus: availabilityStatus || ''
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to load staff records.');
    }
}

/**
 * Displays the Add Staff page.
 */
function showCreateStaff(req, res) {
    res.render('staff/create', {
        title: 'Add Staff'
    });
}

/**
 * Creates a new staff member.
 */
async function createStaff(req, res) {
    try {
        const {
            fullName,
            email,
            phone,
            position,
            availabilityStatus
        } = req.body;

        const emailExists = await staffModel.emailExists(email);

        if (emailExists) {
            return res.render('staff/create', {
                title: 'Add Staff',
                error: 'Email already exists.',
                staff: req.body
            });
        }

        await staffModel.createStaff({
            fullName,
            email,
            phone,
            position,
            availabilityStatus
        });

        res.redirect('/staff');
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to create staff.');
    }
}

/**
 * Displays one staff member.
 */
async function getStaffDetails(req, res) {
    try {
        const staff = await staffModel.findById(req.params.staffID);

        if (!staff) {
            return res.status(404).send('Staff not found.');
        }

        res.render('staff/details', {
            title: 'Staff Details',
            staff
        });
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to load staff.');
    }
}

/**
 * Displays the Edit Staff page.
 */
async function showEditStaff(req, res) {
    try {
        const staff = await staffModel.findById(req.params.staffID);

        if (!staff) {
            return res.status(404).send('Staff not found.');
        }

        res.render('staff/edit', {
            title: 'Edit Staff',
            staff
        });
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to load staff.');
    }
}

/**
 * Updates an existing staff member.
 */
async function updateStaff(req, res) {
    try {
        const staffID = req.params.staffID;

        const {
            fullName,
            email,
            phone,
            position,
            availabilityStatus
        } = req.body;

        const emailExists = await staffModel.emailExists(
            email,
            staffID
        );

        if (emailExists) {
            return res.render('staff/edit', {
                title: 'Edit Staff',
                error: 'Email already exists.',
                staff: {
                    staffID,
                    ...req.body
                }
            });
        }

        await staffModel.updateStaff(staffID, {
            fullName,
            email,
            phone,
            position,
            availabilityStatus
        });

        res.redirect('/staff');
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to update staff.');
    }
}

/**
 * Deletes an unavailable staff member.
 */
async function deleteStaff(req, res) {
    try {
        await staffModel.deleteStaff(req.params.staffID);

        res.redirect('/staff');
    } catch (error) {
        console.error(error);

        res.status(500).send('Unable to delete staff.');
    }
}

module.exports = {
    getAllStaff,
    showCreateStaff,
    createStaff,
    getStaffDetails,
    showEditStaff,
    updateStaff,
    deleteStaff
};