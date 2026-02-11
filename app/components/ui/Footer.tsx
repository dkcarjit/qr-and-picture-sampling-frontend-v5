import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router= useRouter();

  return (
    <footer className="h-12 bg-blue-500 text-white positon-fixed bottom-0 left-0 right-0">
      <div className="flex items-center justify-center gap-2 h-full" onClick={()=>router.push("/")}>
        <span className="font-semibold tracking-wide">SCAN</span>
        <QrCode size={20} />
      </div>
    </footer>
  );
};

export default Footer;
