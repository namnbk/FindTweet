import { Home, LucideHome } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="fixed w-full h-24 shadow-xl bg-white">
            <div className="flex justify-between items-center h-full w-full px-4 2xl:px-16">
                <Link href={"/"} className="flex gap-1">
                    <Home />
                    <span className="text-xl">Main App</span>
                </Link>
                <ul className="flex">
                    <Link href={"/search"}>
                        <li className="ml-5 hover:border-b text-xl">Search</li>
                    </Link>
                    <Link href={"/history"}>
                        <li className="ml-5 hover:border-b text-xl">History</li>
                    </Link>
                    <Link href={"/sports"}>
                        <li className="ml-5 hover:border-b text-xl">Sports</li>
                    </Link>
                </ul>
            </div>
        </nav>
    );
}
 
export default Navbar;