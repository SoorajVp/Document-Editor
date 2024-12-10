"use client"; // If you're using Next.js App Router

import axios from "axios";
import Link from "next/link";
import { useState } from "react";

const UploadComp = () => {
    const [file, setFile] = useState(null); // Store selected file
    const [uploadedUrl, setUploadedUrl] = useState(""); // Store uploaded file URL
    const [loading, setLoading] = useState(false); // Handle loading state

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Save the selected file
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setLoading(true);

        // Read the file as base64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            try {
                const response = await axios.post('/api/upload-document', {
                    document: reader.result, // Base64 data
                    fileName: file.name,  // Original file name
                });

                setUploadedUrl(response.data.documentURL);
            } catch (error) {
                console.error("An error occurred:", error);
            }

            setLoading(false);
        };

        reader.onerror = () => {
            console.error("Failed to read file.");
            setLoading(false);
        };
    };

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Upload Document</h1>

                <div className="mb-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.pptx,.png,.jpg"
                        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition 
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                >
                    {loading ? (
                        <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" width={25} className="mx-auto" height={25} />
                    ) : (
                        "Upload"
                    )}
                </button>

                {uploadedUrl && (
                    <div className="mt-6">
                        <p className="text-gray-700">
                            File uploaded:{" "}
                            <Link
                                href={`/document?url=${uploadedUrl}`}
                                className="text-blue-600 hover:underline"
                            >
                                View Document
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>

    );
};

export default UploadComp;
