"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Search" },
    { href: "/documents", label: "Documents" },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 mb-8 bg-[#13131F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <div className="mr-10 py-4 px-1  font-medium flex flex-row items-center gap-3 ">
            <div className="bg-gradient-to-br from-violet-500 to-teal-400 w-2 h-2 rounded-full" />{" "}
            <p className="text-[#A78BFA]  text-14px">VaultSearch</p>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === item.href
                  ? "border-[#A78BFA] text-[#A78BFA]"
                  : "border-transparent text-[#64748B] hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
