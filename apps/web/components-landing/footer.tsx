export function Footer() {
  return (
    <footer className="bg-black border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">BlockEstate</h3>
            <p className="text-gray-400">
              Revolutionizing real estate with blockchain technology.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400">Properties</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">Contact Us</h3>
            <p className="text-gray-400">
              Email: info@blockestate.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-blue-900">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} BlockEstate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}