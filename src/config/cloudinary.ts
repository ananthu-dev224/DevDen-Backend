import { v2 as cloudinary } from "cloudinary";

const connectCloud = async (): Promise<void> => {
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME as string,
            api_key:process.env.CLOUD_API_KEY as string,
            api_secret:process.env.CLOUD_API_SECRET as string
        })
        console.log("Cloudinary connected!");
    } catch (err) {
        console.log(err);
    }
};

export default connectCloud;