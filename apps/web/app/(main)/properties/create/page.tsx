import { Metadata } from "next";
import AddPropertyForm from "./add-property-form";

export const metadata: Metadata = {
  title: "Add Property - BlockEstate",
  description: "Add a new real estate property to the blockchain",
};

export default function CreatePropertyPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
        <p className="text-muted-foreground mt-2">
          Add your real estate property to the blockchain
        </p>
      </div>
      <AddPropertyForm />
    </div>
  );
}
