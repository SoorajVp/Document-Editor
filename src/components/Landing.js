// src/LandingPage.js

import Link from 'next/link';
import React from 'react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-5xl font-bold text-center text-indigo-600 mb-6">
                Welcome
            </h1>
            <p className="text-base text-gray-700 mb-4 max-w-3xl text-center">
                Welcome to our Document Editor! Easily upload, edit, and manage your files—PDFs, DOCX, or PPTX. Our simple interface makes editing a breeze! Collaborate with friends, access your documents from anywhere, and enjoy fast real-time editing.

            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
                Join the fun and make document management a breeze—because who said editing can’t be entertaining?
            </p>
            <Link href="/upload" >
                <button className="px-6 py-2 bg-indigo-500 hover:bg-white hover:text-indigo-500 border hover:border-indigo-500 shadow text-white font-medium rounded-lg transition duration-300">
                    Let’s get started! 🚀
                </button>
            </Link>
        </div>
    );
};

export default LandingPage;