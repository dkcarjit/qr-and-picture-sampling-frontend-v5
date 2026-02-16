import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 h-12 bg-blue-500 text-white flex items-center justify-between px-3 shadow-md">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        BACK
      </button>

      <button onClick={() => router.push("/")}>
        <Home size={20} />
      </button>
    </header>
  );
};

export default Header;
