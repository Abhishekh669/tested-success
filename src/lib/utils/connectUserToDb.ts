import mongoose from "mongoose"

let userConnection: mongoose.Connection | null = null;

export const ConnectUserToDb = async() => {
    if (userConnection) {
        return userConnection;
    }

    try {
        userConnection = await mongoose.createConnection(process.env.USERDB!, {
            bufferCommands: true,
            maxPoolSize: 10,
        });

        userConnection.on('connected', () => {
            console.log('Users database connected successfully');
        });

        userConnection.on('error', (err) => {
            console.error('Users database connection error:', err);
        });

        userConnection.on('disconnected', () => {
            console.log('Users database disconnected');
        });

        return userConnection;
    } catch (error) {
        console.error('Failed to connect to users database:', error);
        throw error;
    }
}