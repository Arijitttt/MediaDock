import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

//cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECTET 
});


const uploadOnCloudinary  = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath,{
                resource_type: "auto",
            }
        )
        console.log('File uploaded on cloudinary, File src - '+response);
        
        //once file is uploaded, we would like to delete it from our local server
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}