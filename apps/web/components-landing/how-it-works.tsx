import { UserPlus, ListPlus, ShoppingCart, Shield } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "User Registration",
    description: "Sign up securely with email and verify your identity with Aadhaar card integration."
  },
  {
    icon: ListPlus,
    title: "Property Listing",
    description: "List properties with detailed information and secure document uploads."
  },
  {
    icon: ShoppingCart,
    title: "Buying Process",
    description: "Browse properties and make secure transactions with our integrated payment system."
  },
  {
    icon: Shield,
    title: "Verification",
    description: "Automated blockchain verification ensures authenticity and compliance."
  }
];

export function HowItWorks() {
  return (
    <div className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-6 rounded-lg border border-blue-900 bg-black/50 hover:border-blue-400 transition-colors">
                <step.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-blue-300 mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-900" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}