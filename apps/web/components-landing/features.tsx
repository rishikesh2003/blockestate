import { Shield, Clock, DollarSign, Bell, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Unmatched Security",
    description: "Blockchain technology provides robust security measures protecting your property documents from tampering and fraud."
  },
  {
    icon: Clock,
    title: "Streamlined Process",
    description: "Automated verification and approval processes make property transactions faster and more efficient."
  },
  {
    icon: DollarSign,
    title: "Cost-Effective",
    description: "Minimized transaction fees and overhead costs using efficient blockchain networks."
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    description: "Stay informed with instant notifications for all your property transactions and updates."
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Quick and secure document verification using blockchain technology."
  }
];

export function Features() {
  return (
    <div className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-400 mb-12">Why Choose BlockEstate?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-blue-900 bg-black/50 hover:border-blue-400 transition-colors"
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-blue-300 mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}