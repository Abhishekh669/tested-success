import { ConnectBooksToDb } from '../utils/connectBooksToDb';
import { Book } from '../models/Book';

export const getBooks = async (userId: string) => {
    try {
        const booksConnection = await ConnectBooksToDb();
        const BookModel = booksConnection.model('Book', Book);
        
        const books = await BookModel.find({ userId });
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}