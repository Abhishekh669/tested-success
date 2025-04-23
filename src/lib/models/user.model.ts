import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    userId: {
        type: String,
    }, 
    name: {
        type: String, 
    }
})
const UserModel = mongoose.models.UserModel || mongoose.model("UserModel", UserSchema)
export default UserModel