import { Officer, PoliceStation } from "../models/index.js";

export const createPoliceStation = async (req, res) => {
    try {
        const { name, address, phone_number, email, landline, latitude, longitude } = req.body;
        
        if(!name || !address || !phone_number || !landline) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newPoliceStation = new PoliceStation(
            { name, 
              address, 
              contact: { phone_number, email, landline },
              location: { latitude, longitude }
            });

        await newPoliceStation.save();
        
        res.status(201).json({
            success: true,
            data: newPoliceStation
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};


export const getStations = async (req, res) => {
    try {
        const stations = await PoliceStation.find().populate('officer_IDs', '-password');
        res.status(200).json({
            success: true,
            data: stations
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};


