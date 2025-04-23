import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
    userId: {
        type: String,
    }, 
    bookName: {
        type: String, 
    }
})
const BookModel = mongoose.models.BookModel || mongoose.model("BookModel", PostSchema)
export default BookModel