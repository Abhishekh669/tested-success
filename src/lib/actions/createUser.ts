import { ConnectUserToDb } from '../utils/connectUserToDb';
import { User } from '../models/User';

export const getUser = async (userId: string) => {
    try {
        const userConnection = await ConnectUserToDb();
        const UserModel = userConnection.model('User', User);
        
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            // Create a new user if not found
            const newUser = await UserModel.create({
                _id: userId,
                name: 'Default User',
                email: `user${userId}@example.com`,
            });
            return newUser;
        }
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}