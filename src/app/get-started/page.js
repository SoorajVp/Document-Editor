"use client";
import React from "react";
import { signIn, signOut } from "next-auth/react";
const Page = () => {

    return (
        <button onClick={() => signIn()} className="text-green-600 ml-auto">
            Sign In
        </button>
    );
};

export default Page;
