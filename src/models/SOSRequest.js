import mongoose from 'mongoose';
import { generateId } from '../lib/idGenerator.js';

// Location subdocument schema for SOS requests (Number coordinates)
const sosLocationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, { _id: false });

const sosRequestSchema = new mongoose.Schema({
    custom_id: {
        type: String,
        unique: true,
        required: true,
        default: () => generateId('SOS')
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nearest_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliceStation',
        required: true
    },
    location: {
        type: sosLocationSchema,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
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
sosRequestSchema.pre('save', async function(next) {
    this.updated_at = Date.now();

    if (!this.custom_id) {
        let id;
        let exists;
        do {
            id = generateId('SOS');
            exists = await this.constructor.findOne({ custom_id: id });
        } while (exists);
        this.custom_id = id;
    }

    next();
});

const SOSRequest = mongoose.model('SOSRequest', sosRequestSchema);

export default SOSRequest;

