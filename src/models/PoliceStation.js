import mongoose from 'mongoose';
import { generateId } from '../lib/idGenerator.js';

// Contact subdocument schema for police stations
const stationContactSchema = new mongoose.Schema({
    phone_number: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
    },
    landline: {
        type: String,
        required: true
    }
}, { _id: false });

// Location subdocument schema for police stations (String coordinates)
const stationLocationSchema = new mongoose.Schema({
    latitude: {
        type: String,
        required: false,
    },
    longitude: {
        type: String,
        required: false,
    }
}, { _id: false });

const policeStationSchema = new mongoose.Schema({
    custom_id: {
        type: String,
        unique: true,
        required: true,
        default: () => generateId('PS')
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        type: stationContactSchema,
        required: true
    },
    location: {
        type: stationLocationSchema,
        required: true
    },
    officer_IDs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Officer',
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update updated_at before saving and ensure custom_id
policeStationSchema.pre('save', async function(next) {
    this.updated_at = Date.now();

    if (!this.custom_id) {
        let id;
        let exists;
        do {
            id = generateId('PS');
            exists = await this.constructor.findOne({ custom_id: id });
        } while (exists);
        this.custom_id = id;
    }

    next();
});

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

export default PoliceStation;

