"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const connectCloud = async () => {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET
        });
        console.log("Cloudinary connected!");
    }
    catch (err) {
        console.log(err);
    }
};
exports.default = connectCloud;
