import axios from 'axios';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'; // Import from xmldom
import cloudinary from '../../lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { documentUrl, updatedTextBlocks } = req.body;

    try {
        if (!documentUrl || !Array.isArray(updatedTextBlocks)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        console.log('Received payload:', { documentUrl, updatedTextBlocks });

        // Fetch the original document
        const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
        const originalDoc = Buffer.from(response.data);

        // Load DOCX as a ZIP archive
        const zip = await JSZip.loadAsync(originalDoc);
        let documentXml = await zip.file('word/document.xml').async('string');

        console.log('Original document.xml loaded.');

        // Parse and modify the XML document for each text block
        const parser = new DOMParser();
        const serializer = new XMLSerializer();
        const doc = parser.parseFromString(documentXml, 'application/xml');

        const textNodes = Array.from(doc.getElementsByTagName('w:t'));

        updatedTextBlocks.forEach((block, index) => {
            if (index < textNodes.length) {
                const targetNode = textNodes[index];
                const runNode = targetNode.parentNode; // <w:r> containing the <w:t>
                const parentNode = runNode.parentNode; // <w:p> containing the <w:r>

                // Split content by lines and create new nodes
                const newTextContent = block.split('\n').map(line => {
                    // Clone the <w:r> node to preserve styles
                    const newRunNode = runNode.cloneNode(true);
                    const newTextElement = newRunNode.getElementsByTagName('w:t')[0];

                    // Update the text content
                    newTextElement.textContent = line;
                    newTextElement.setAttribute('xml:space', 'preserve'); // Preserve spaces
                    return newRunNode;
                });

                // Clear existing child nodes in <w:p>
                while (parentNode?.firstChild) {
                    parentNode.removeChild(parentNode.firstChild);
                }

                // Append new nodes with line breaks
                if (parentNode) {
                    newTextContent.forEach((newRunNode, idx) => {
                        parentNode.appendChild(newRunNode);
                        if (idx < newTextContent.length - 1) {
                            const breakElement = doc.createElement('w:br');
                            parentNode.appendChild(breakElement);
                        }
                    });
                }
              
            } else {
                console.warn(`No matching <w:t> found for block ${index}`);
            }
        });

        // Serialize the updated XML back to a string
        documentXml = serializer.serializeToString(doc);

        console.log('documentXml ', documentXml )

        // Update the ZIP file with the modified document.xml
        zip.file('word/document.xml', documentXml);
        const updatedDoc = await zip.generateAsync({ type: 'nodebuffer' });

        // Upload the updated document to Cloudinary (direct buffer upload)
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', public_id: uuidv4()+".docx" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(updatedDoc);
        });

        console.log('Cloudinary upload result:', uploadResult);

        // Return the Cloudinary URL
        res.status(200).json({
            message: 'Document saved successfully',
            url: uploadResult.secure_url,
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to process and upload document', error: error.message });
    }
}
