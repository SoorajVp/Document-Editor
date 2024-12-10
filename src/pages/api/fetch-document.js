import axios from "axios";
import mammoth from "mammoth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { documentUrl } = req.body;

    try {
        // Fetch the document
        const response = await axios.get(documentUrl, {
            responseType: "arraybuffer",
        });

        // Extract text content using Mammoth
        const { value: extractedText } = await mammoth.extractRawText({
            buffer: response.data,
        });
        
        // Split the text into blocks (e.g., by paragraph)
        const textBlocks = extractedText.split("\n\n").filter((block) => block.trim());
        // console.log('textBlocks =>', textBlocks)
        res.status(200).json({ textBlocks});
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch or parse document", error: error.message });
    }
}
