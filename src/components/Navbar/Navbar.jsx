import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-bold text-blue-600">AsaHub</div>

        <div className="hidden md:flex gap-6 text-gray-600">

          <Link to="/marketplace">Marketplace</Link>
          <Link to="/edukasi">Edukasi</Link>
          <Link to="/karir">Karir</Link>
          <Link to="/">Home</Link>
        </div>

        <Menu className="md:hidden" size={24} />
      </div>
    </nav>
  );
}
