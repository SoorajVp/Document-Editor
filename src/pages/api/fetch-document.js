import axios from "axios";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { documentUrl } = req.body;

    try {
        if (!documentUrl) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        console.log("Fetching document from URL:", documentUrl);

        // Fetch the document
        const response = await axios.get(documentUrl, { responseType: "arraybuffer" });
        const originalDoc = Buffer.from(response.data);

        // Load DOCX as a ZIP archive
        const zip = await JSZip.loadAsync(originalDoc);
        const documentXml = await zip.file("word/document.xml").async("string");

        console.log("Document.xml successfully loaded.");

        // Parse the XML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(documentXml, "application/xml");

        // Extract text from <w:t> nodes
        const textNodes = Array.from(doc.getElementsByTagName("w:t"));
        const textBlocks = textNodes.map((node) => node.textContent.trim()).filter(Boolean);

        // Group the text by paragraphs (<w:p>)
        const paragraphs = [];
        let currentParagraph = [];

        textNodes.forEach((node) => {
            const runNode = node.parentNode; // <w:r> node
            const paragraphNode = runNode.parentNode; // <w:p> node

            if (currentParagraph.length === 0 || currentParagraph[currentParagraph.length - 1].parentNode === paragraphNode) {
                currentParagraph.push(node);
            } else {
                paragraphs.push(currentParagraph);
                currentParagraph = [node];
            }
        });

        if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph);
        }

        const groupedTextBlocks = paragraphs.map((paragraph) =>
            paragraph.map((node) => node.textContent).join(" ")
        );

        console.log("Extracted text blocks:", groupedTextBlocks);

        res.status(200).json({ textBlocks: groupedTextBlocks });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Failed to fetch or parse document", error: error.message });
    }
}
