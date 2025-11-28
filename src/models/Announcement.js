import mongoose from 'mongoose';
import { generateId } from '../lib/idGenerator.js';

const announcementSchema = new mongoose.Schema({
    custom_id: {
        type: String,
        unique: true,
        required: true,
        default: () => generateId('ANN')
    },
    station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PoliceStation',
        required: false,
        default: null
    },
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
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
announcementSchema.pre('save', async function(next) {
    this.updated_at = Date.now();

    if (!this.custom_id) {
        let id;
        let exists;
        do {
            id = generateId('ANN');
            exists = await this.constructor.findOne({ custom_id: id });
        } while (exists);
        this.custom_id = id;
    }

    next();
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;

