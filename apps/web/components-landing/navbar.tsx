"use client";

import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-sm border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Boxes className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-blue-400">BlockEstate</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
            >
              <SignInButton />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <SignUpButton />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
