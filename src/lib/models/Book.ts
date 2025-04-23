import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    description: String,
    edition: String,
    mrp: String,
    publication: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Book = BookSchema; 