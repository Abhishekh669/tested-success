import mongoose from "mongoose"

let booksConnection: mongoose.Connection | null = null;

export const ConnectBooksToDb = async() => {
    if (booksConnection) {
        return booksConnection;
    }

    try {
        booksConnection = await mongoose.createConnection(process.env.BOOKDB!, {
            bufferCommands: true,
            maxPoolSize: 10,
        });

        booksConnection.on('connected', () => {
            console.log('Books database connected successfully');
        });

        booksConnection.on('error', (err) => {
            console.error('Books database connection error:', err);
        });

        booksConnection.on('disconnected', () => {
            console.log('Books database disconnected');
        });

        return booksConnection;
    } catch (error) {
        console.error('Failed to connect to books database:', error);
        throw error;
    }
}