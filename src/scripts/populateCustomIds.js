import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import { generateId } from '../lib/idGenerator.js';
import { User, Officer, PoliceStation, Blotter, ClearanceApplication, SOSRequest, Announcement } from '../models/index.js';

dotenv.config();

const models = [
    { Model: User, prefix: 'USR' },
    { Model: Officer, prefix: 'OFF' },
    { Model: PoliceStation, prefix: 'PS' },
    { Model: Blotter, prefix: 'BLT' },
    { Model: ClearanceApplication, prefix: 'CLR' },
    { Model: SOSRequest, prefix: 'SOS' },
    { Model: Announcement, prefix: 'ANN' }
];

async function ensureCustomIds() {
    await connectDB();

    for (const { Model, prefix } of models) {
        console.log(`Processing ${Model.modelName}...`);
        const docs = await Model.find({ custom_id: { $exists: false } }).lean();
        console.log(`Found ${docs.length} documents without custom_id in ${Model.modelName}`);
        for (const doc of docs) {
            let id;
            let exists;
            do {
                id = generateId(prefix);
                exists = await Model.findOne({ custom_id: id });
            } while (exists);

            // Use direct update to avoid triggering other hooks
            await Model.updateOne({ _id: doc._id }, { $set: { custom_id: id } });
            console.log(`Updated ${Model.modelName} ${doc._id} -> ${id}`);
        }
    }

    console.log('Done.');
    process.exit(0);
}

ensureCustomIds().catch(err => {
    console.error(err);
    process.exit(1);
});
