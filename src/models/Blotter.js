import mongoose from 'mongoose';
import { generateId } from '../lib/idGenerator.js';

// Location subdocument schema for incidents
const locationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, { _id: false });

// Incident subdocument schema
const incidentSchema = new mongoose.Schema({
    incident_type: {
        type: String,
        required: true,
        enum: ['Theft', 'Robbery', 'Assault', 'Other']
    },
    date: {
        type: Date,
        required: true
    },
    time: { 
        type: String,
        required: true
    },
    location: {
        type: locationSchema,
        required: false
    },
    description: {
        type: String,
        required: true
    }
}, { _id: false });

// Attachments subdocument schema
const attachmentSchema = new mongoose.Schema({
    attachment_type: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { _id: false });

const blotterSchema = new mongoose.Schema({
    custom_id: {
        type: String,
        unique: true,
        required: true,
        default: () => generateId('BLT')
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    incident: {
        type: incidentSchema,
        required: true
    },
    attachments: {
        type: [attachmentSchema],
        default: []
    },
    assigned_officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Under Review', 'Investigating', 'Resolved', 'Closed'],
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
blotterSchema.pre('save', async function(next) {
    this.updated_at = Date.now();

    if (!this.custom_id) {
        let id;
        let exists;
        do {
            id = generateId('BLT');
            exists = await this.constructor.findOne({ custom_id: id });
        } while (exists);
        this.custom_id = id;
    }

    next();
});

const Blotter = mongoose.model('Blotter', blotterSchema);

export default Blotter;

