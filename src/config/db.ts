import mongoose from "mongoose";


const connectDb = async (): Promise<void> => {
    try {
        const url: any = process.env.MONGO_URL;
        await mongoose.connect(url);
        console.log("Mongo Db connected");
    } catch (err) {
        console.log(err);
    }
};

export default connectDb;