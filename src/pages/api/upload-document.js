// import { v2 as cloudinary } from 'cloudinary';
import cloudinary from '../../lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from "path"

// Disable Next.js built-in bodyParser for raw data if required
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb', // Adjust size limit based on your requirements
        },
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { document, fileName } = req.body; 
            console.log("fileName => ", fileName)
            let fileExtension = path.extname(fileName).toLowerCase();
            if(fileExtension === ".pdf") {
                fileExtension = ""
            }
            if (!document) {
                return res.status(400).json({ error: 'document data is required' });
            }
            console.log("step 1 => ", fileName)

            // Upload the base64 string to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(document, {
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET, // Predefined preset in Cloudinary
                resource_type: "auto", 
                public_id: `${uuidv4() + fileExtension }`,
                type: 'upload', 
                timeout: 120000,
            });
            console.log("step 2 => ", fileName)

            const documentURL = cloudinary.url(uploadResponse.public_id, {
                resource_type: "auto", // Ensure raw access for files like PDFs
                // secure: true,
            });
            console.log("step 3 => ", fileName)

            console.log("this is document url => :", documentURL)
            // Return the uploaded document URL
            res.status(200).json({ documentURL: uploadResponse.secure_url, secure_url: documentURL });
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ error: 'Something went wrong during document upload' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
