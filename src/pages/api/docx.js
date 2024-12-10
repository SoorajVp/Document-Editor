import axios from 'axios';
import { Document, Packer, TextRun, Paragraph } from 'docx';


export default async function handler(req, res) {
    // Check if the request method is POST
    console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
    if (req.method === 'POST') {
        const { documentUrl, edits } = req.body ;
        console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
        if (!documentUrl || !edits) {
            return res.status(400).json({ error: 'Document URL and edits are required' });
        }

        try {
            // // Fetch the document from the URL
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
            const buffer = response.data;

            // Parse the document
            const doc = await Document.load(buffer);

            // Loop through the document and apply the edits line by line
            doc.sections.forEach((section) => {
                section.children.forEach((paragraph, index) => {
                    if (edits[index]) {
                        // Replace the paragraph text with the edit
                        paragraph.children = [
                            new TextRun({ text: edits[index], bold: true })
                        ];
                    }
                });
            });

            // Save the modified document to a buffer
            const updatedBuffer = await Packer.toBuffer(doc);

            // Upload the updated document to Cloudinary (or another storage)
            const uploadResult = await uploadToCloudinary(updatedBuffer, 'edited_document');

            // Return the Cloudinary URL of the updated document
            return res.status(200).json({ url: uploadResult.secure_url });
            
        } catch (error) {
            console.error('Error editing the document:', error);
            return res.status(500).json({ error: 'Failed to edit the document' });
        }
    } else {
        // Only allow POST requests
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
