import { Officer, PoliceStation } from "../models/index.js";
import { validateEmail } from "./auth.controller.js";
import 'pdfkit-table';

export const createOfficer = async (req, res) => {
    try {
        const { first_name, last_name, email, role, station_id, mobile_number, status } = req.body;        


        if (!first_name || !last_name || !email || !role || !station_id || !mobile_number) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if email already exists
        const existingOfficer = await Officer.findOne({ email });
        if (existingOfficer) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const newOfficer = new Officer({
            first_name,
            last_name,
            email,
            role,
            station_id,
            contact: {
                mobile_number: mobile_number
            },
            status,
        });

        const station = await PoliceStation.findByIdAndUpdate(
            station_id,
            { $push: { officer_IDs: newOfficer._id } },
            { new: true }
        )

        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }

        const savedOfficer = await newOfficer.save();
        res.status(201).json({
            success: true,
            message: 'Officer created successfully',
            officer: savedOfficer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export const getAllOfficers = async (req, res) => {
    try {
        const officers = await Officer.find().populate('station_id', 'name');
        res.status(200).json({
            success: true,
            data: officers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export const updateOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, role, station_id, mobile_number, status } = req.body;

        if (!first_name || !last_name || !email || !role || !station_id || !mobile_number || !status) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const officer = await Officer.findById(id);
        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        officer.first_name = first_name;
        officer.last_name = last_name;
        officer.email = email;
        officer.role = role;
        officer.station_id = station_id;
        officer.contact.mobile_number = mobile_number;
        officer.status = status;

        const savedOfficer = await officer.save();
        res.status(200).json({
            success: true,
            message: 'Officer updated successfully',
            officer: savedOfficer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export const deleteOfficer = async (req, res) => {
    try {
        const { id } = req.params; 
        const officer = await Officer.findByIdAndDelete(id);

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Officer deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

// Add these methods to your officer.controller.js

export const getOfficerProfile = async (req, res) => {
    try {
        // Assuming you have authentication middleware that sets req.user
        const officerId = req.user.id; // or req.user._id depending on your auth setup
        
        const officer = await Officer.findById(officerId)
            .populate('station_id', 'name')
            .select('-password'); // Exclude password from response

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: officer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const updateOfficerProfile = async (req, res) => {
    try {
        // Assuming you have authentication middleware that sets req.user
        const officerId = req.user.id; // or req.user._id depending on your auth setup
        const { first_name, last_name, email, mobile_number, radio_id } = req.body;

        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and email are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if email is being changed and if it already exists for another officer
        const officer = await Officer.findById(officerId);
        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        if (email !== officer.email) {
            const existingOfficer = await Officer.findOne({ email });
            if (existingOfficer) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update officer details
        officer.first_name = first_name;
        officer.last_name = last_name;
        officer.email = email;
        
        // Update contact information
        if (!officer.contact) {
            officer.contact = {};
        }
        officer.contact.mobile_number = mobile_number || officer.contact.mobile_number;
        officer.contact.radio_id = radio_id || officer.contact.radio_id;

        const savedOfficer = await officer.save();
        
        // Remove password from response
        const officerResponse = savedOfficer.toObject();
        delete officerResponse.password;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: officerResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};