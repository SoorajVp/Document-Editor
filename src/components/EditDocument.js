"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import path from "path";
import { useRouter, useSearchParams } from "next/navigation";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const EditDocument = () => {
    const [textBlocks, setTextBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const url = searchParams.get("doc");
    const router = useRouter()
    const fileExtension = path.extname(url || "").toLowerCase();

    useEffect(() => {
        if (!url) {
            console.error("Document URL is missing.");
            return;
        }

        const fetchAndParseDocument = async () => {
            setLoading(true);
            try {
                const response = await axios.post("/api/fetch-document", { documentUrl: url });
                console.log("this is the response data => ", response);
                const { textBlocks } = response.data; // Backend returns parsed text blocks
                setTextBlocks(textBlocks || []); // Default to an empty array if undefined
                console.log("Document loaded successfully!");
            } catch (error) {
                console.error("Error loading document:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndParseDocument();
    }, [url]);

    const handleTextChange = (index, value) => {
        const updatedBlocks = [...textBlocks];
        updatedBlocks[index] = value;
        setTextBlocks(updatedBlocks);
    };

    const handleSubmit = async () => {
        if (!url || textBlocks.length === 0) {
            console.error("Cannot submit: either the URL or text blocks are missing.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                documentUrl: url,
                updatedTextBlocks: textBlocks,
            };
            console.log("Payload to send =>", payload);

            const response = await axios.post("/api/save-document", payload);
            console.log("Document updated successfully!", response.data);
            alert("Document saved successfully!");
            router.push(`/edit?doc=${response.data?.url}`)
        } catch (error) {
            console.error("Error updating document:", error.message);
            alert("Failed to save document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2">
            {/* Document Viewer */}
            <div className="w-full h-screen bg-gray-100 p-2">
                {fileExtension === ".pdf" ? (
                    <iframe
                        src={url}
                        width="100%"
                        height="100%"
                        title="PDF Viewer"
                    ></iframe>
                ) : (
                    <DocViewer
                        documents={[{ uri: url, fileType: "docx" }]}
                        pluginRenderers={DocViewerRenderers}
                        className="h-full border"
                    />
                )}
            </div>

            {/* Editor */}
            <div className="w-full h-screen bg-gray-100 border flex flex-col">
                {/* Top Bar */}
                <div className="flex justify-between items-center border p-3 bg-white">
                    <h3 className="text-base font-semibold">Edit Text Blocks</h3>
                    <button
                        onClick={handleSubmit}
                        className={`w-40 bg-indigo-500 hover:bg-indigo-600 shadow text-white text-sm font-medium py-2 px-4 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <img
                                src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"
                                width={23}
                                className="mx-auto"
                                height={23}
                                alt="Loading"
                            />
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-scroll p-2 bg-indigo-50">
                    {loading ? (
                        <div className="text-center text-gray-600">Loading document...</div>
                    ) : textBlocks.length > 0 ? (
                        textBlocks.map((block, index) => (
                            <div key={index} className="mb-2">
                                <textarea
                                    value={block}
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    onInput={(e) => {
                                        e.target.style.height = "auto"; // Reset height
                                        e.target.style.height = `${e.target.scrollHeight}px`; // Set height to scrollHeight
                                    }}
                                    className="w-full text-sm text-neutral-800 border outline-indigo-400 p-2"
                                    style={{ overflow: "hidden" }} // Prevent scrollbar
                                />
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-600">No text blocks to edit.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditDocument;
