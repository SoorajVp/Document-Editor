"use client";
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import path from "path"
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

const ViewDocument = () => {
    const [docx, setDocx] = useState(null)
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const router = useRouter()
    let fileExtension = path.extname(url).toLowerCase();
    const handleConvert = async () => {
        try {
            setLoading(true)
            const response = await axios.post("/api/pdf-to-docx", {
                url: url
            });
            console.log("this is success response : ", response.data.result.Url)
            setDocx([{ uri: response.data.result.Url, fileType: "docx" }])
        } catch (error) {
            console.log("this is the error message", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='grid grid-cols-2'>
            <div className='w-full h-screen bg-gray-100 p-2'>
                {
                    fileExtension === ".pdf" ?
                        <iframe src={url} width="100%" height="100%" className="" title="PDF Viewer" ></iframe> :
                        <DocViewer documents={[{ uri: url, fileType: fileExtension === ".docx" ? "docx" : "pptx" }]} pluginRenderers={DocViewerRenderers} className='h-full border' />
                }

            </div>
            <div className='w-full h-screen bg-gray-200 p-2'>
                {
                    docx ?
                        <>
                            <div className="flex justify-end pb-2">
                                <a
                                    href={docx[0].uri} // Document URL
                                    download={docx[0].fileName || true} // File name for download
                                    className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Download Document
                                </a>
                            </div>
                            <DocViewer documents={docx} pluginRenderers={DocViewerRenderers} className='h-full border' />
                        </> :
                        <div className='flex justify-center items-center h-full' >
                            {/* <button onClick={handleConvert} className='px-4 py-2 bg-blue-600 text-white rounded-md'>Convert to DOCX</button> */}
                            <div className='space-y-2 flex flex-col'>
                                <button
                                    onClick={() => router.push(`/edit?doc=${url}`)}
                                    className={`w-64 bg-indigo-500 hover:bg-indigo-600 shadow text-white font-medium py-2 px-4 rounded-lg transition 
                                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                >
                                    Edit Document
                                </button>
                                {
                                    fileExtension === ".pdf" &&
                                    <button
                                        onClick={handleConvert}
                                        className={`w-64 bg-indigo-500 hover:bg-indigo-600 shadow text-white font-medium py-2 px-4 rounded-lg transition 
                                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" width={25} className="mx-auto" height={25} />
                                        ) : (
                                            "Convert to DOCX"
                                        )}
                                    </button>
                                }

                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default ViewDocument