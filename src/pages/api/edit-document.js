import axios from 'axios';
import JSZip from 'jszip';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { documentUrl, updatedTextBlocks } = req.body;

    console.log('updatedTextBlocks =>', updatedTextBlocks)

    try {
        if (!documentUrl || !updatedTextBlocks || !Array.isArray(updatedTextBlocks)) {
            throw new Error('Invalid payload: documentUrl and updatedTextBlocks are required.');
        }

        console.log("Fetching the original document...");
        const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
        const originalDoc = Buffer.from(response.data);

        console.log("Loading the DOCX file as a ZIP archive...");
        const zip = await JSZip.loadAsync(originalDoc);

        if (!zip.file('word/document.xml')) {
            throw new Error('word/document.xml not found in the DOCX file');
        }

        let documentXml = await zip.file('word/document.xml').async('string');
        console.log("Original document.xml content loaded.");

        console.log("Replacing placeholders in document.xml...");
        updatedTextBlocks.forEach((block, index) => {
            const placeholder = new RegExp(`\\{block${index}\\}`, 'g'); // Replace {block0}, {block1}, etc.
            documentXml = documentXml.replace(placeholder, block);
        });

        console.log("Modified document.xml content:", documentXml);

        console.log("Updating the ZIP archive with modified document.xml...");
        zip.file('word/document.xml', documentXml);

        console.log("Generating the updated DOCX file...");
        const updatedDoc = await zip.generateAsync({ type: 'nodebuffer' });

        console.log("Uploading the updated document to Cloudinary...");
        const fileExtension = path.extname(documentUrl).toLowerCase() || '.docx';
        const fileName = `${uuidv4()}${fileExtension}`;

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', public_id: fileName },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        return reject(error);
                    }
                    resolve(result);
                }
            );
            uploadStream.end(updatedDoc);
        });

        console.log("Cloudinary upload successful:", uploadResult);

        res.status(200).json({
            message: 'Document saved successfully',
            url: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            message: 'Failed to save and upload document',
            error: error.message,
        });
    }
}
