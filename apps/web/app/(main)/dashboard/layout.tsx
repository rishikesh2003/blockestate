import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockEstate - Blockchain Land Registry",
  description: "Secure land registration system powered by blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        <div className={"flex justify-end items-center"}>
          <UserButton />
        </div>
        {children}
      </main>
    </div>
  );
}
