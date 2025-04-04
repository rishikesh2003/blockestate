import { createDocumentHash } from "./blockchain";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import path from "path";

export async function saveDoc(file: File) {
  if (!file) {
    return { error: "No file found" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename to avoid path traversal issues
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedFilename}`;

    // Create directory path and ensure it exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const uploadPath = path.join(uploadDir, filename);

    // Make sure the directory exists
    try {
      await fs.access(uploadDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Now write the file with the buffer
    await fs.writeFile(uploadPath, buffer);

    return {
      message: "Upload successful",
      url: `/uploads/${filename}`,
    };
  } catch (error) {
    console.error("Error saving document:", error);
    return { error: "Failed to save document" };
  }
}

export async function uploadDocument(
  document: File
): Promise<{ url: string; hash: string }> {
  // In a real implementation, this would upload to a service like IPFS
  // For demo purposes, we're generating a fake URL

  const formData = new FormData();
  formData.append("file", document);

  // Convert file to buffer for hashing
  const buffer = await document.arrayBuffer(); // `document` is a File object
  const documentText = new TextDecoder().decode(buffer);

  // Generate hash for blockchain storage
  const hash = createDocumentHash(documentText);

  const result = await saveDoc(document);

  if ("error" in result) {
    throw new Error(result.error as string);
  }

  return {
    url: result.url,
    hash,
  };
}

// Retrieve a document from storage
export async function getDocument(url: string): Promise<Blob | null> {
  // In a real implementation, this would fetch from IPFS or similar
  // For demo purposes, we return a simple text blob

  if (!url.startsWith("https://fake-document-storage.com/")) {
    return null;
  }

  const mockDocumentContent =
    "This is a simulated document content for demo purposes.";
  return new Blob([mockDocumentContent], { type: "text/plain" });
}

// Verify a document hash against the stored document
export async function verifyDocumentHash(
  url: string,
  hash: string
): Promise<boolean> {
  // In a real implementation, this would download the document from IPFS and verify its hash
  // For demo purposes, we'll simulate verification

  try {
    const document = await getDocument(url);

    if (!document) {
      return false;
    }

    const documentText = await document.text();
    const calculatedHash = createDocumentHash(documentText);

    return calculatedHash === hash;
  } catch (error) {
    console.error("Error verifying document hash:", error);
    return false;
  }
}
