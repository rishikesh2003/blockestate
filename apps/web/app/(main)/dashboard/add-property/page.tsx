"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

// Smart contract ABI for property registration
const contractABI = [
  "function registerProperty(string name, string location, string documentHash, uint256 price) returns (uint256)",
  "event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string name, uint256 price)",
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number",
    }),
  description: z.string().optional(),
});

const Page = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      price: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      // In a real implementation, you would upload to IPFS or your storage service
      // For this demo, we'll simulate an upload and return a fake hash
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload delay

      // Return a fake IPFS hash
      return `ipfs-${Date.now()}-${file.name.replace(/\s/g, "")}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload file");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      toast.info("Processing your property...");

      if (!imageFile) {
        toast.error("Please upload a property image");
        setIsUploading(false);
        return;
      }

      if (!documentFile) {
        toast.error("Please upload property documents");
        setIsUploading(false);
        return;
      }

      // Check if browser has Ethereum provider (MetaMask)
      if (!window.ethereum) {
        throw new Error(
          "No Ethereum wallet detected. Please install MetaMask."
        );
      }

      // Upload files to IPFS or storage service
      const imageUrl = await uploadToIPFS(imageFile);
      const documentUrl = await uploadToIPFS(documentFile);

      // Generate a hash of the document for blockchain storage
      const documentHash = ethers.keccak256(ethers.toUtf8Bytes(documentUrl));

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const ownerAddress = accounts[0];

      // Get contract address from environment or config
      const contractAddress =
        process.env.NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS || "";

      // Create a provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      toast.info("Please confirm the transaction in your wallet");

      // Register property on blockchain
      const tx = await contract.registerProperty(
        values.name,
        values.location,
        documentHash,
        ethers.parseEther(values.price),
        { gasLimit: 500000 }
      );

      toast.loading("Registering property on blockchain...");
      const receipt = await tx.wait();

      // Extract property ID from events
      let blockchainId = 0;
      const event = receipt.logs
        .filter((log: any) => log.fragment?.name === "PropertyRegistered")
        .map((log: any) => contract.interface.parseLog(log))[0];

      if (event) {
        blockchainId = Number(event.args.propertyId);
      }

      // Save to database
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          location: values.location,
          price: values.price,
          blockchainId,
          documentUrl,
          documentHash,
          imgUrl: imageUrl,
          description: values.description,
          isForSale: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save property to database");
      }

      toast.success("Property added successfully", {
        description: "Your property has been registered on the blockchain",
      });

      // Redirect to listings page
      router.push("/dashboard/your-listings");
    } catch (error: any) {
      console.error("Error adding property:", error);

      if (error.code === 4001) {
        toast.error("Transaction rejected", {
          description: "You declined the transaction in your wallet.",
        });
      } else {
        toast.error("Failed to add property", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Property</h2>
        <p className="text-muted-foreground">
          List a new property on the blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Enter the details of your property to list it on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter property name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0.5"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Property description"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="propertyImage">Property Image</Label>
                <Input
                  id="propertyImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Property preview"
                      className="w-full max-w-md h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Property Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload property documents (deeds, certificates, etc.)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Processing..." : "Add Property"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
