import { createDocumentHash } from "./blockchain";

// For demonstration purposes, we'll simulate document storage
// In a production environment, this would connect to a service like IPFS through Pinata, Filebase, etc.

// Simulate uploading a document and getting a URL
export async function uploadDocument(
  document: File
): Promise<{ url: string; hash: string }> {
  // In a real implementation, this would upload to a service like IPFS
  // For demo purposes, we're generating a fake URL

  // Convert file to buffer for hashing
  const buffer = await document.arrayBuffer();
  const documentText = new TextDecoder().decode(buffer);

  // Create hash for blockchain storage
  const hash = createDocumentHash(documentText);

  // Use a consistent dummy URL as requested
  const url = `https://dummy-document-storage.com/${Date.now()}-${document.name}`;

  return {
    url,
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
