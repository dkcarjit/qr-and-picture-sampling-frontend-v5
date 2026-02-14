import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router= useRouter();

  return (
    <footer className="h-18 bg-blue-500 text-white fixed bottom-0 left-0 right-0">
      <div className="flex items-center justify-center gap-2 h-full" onClick={()=>router.push("/")}>
        <span className="font-semibold tracking-wide text-4xl">SCAN</span>
        <QrCode size={28} />
      </div>
    </footer>
  );
};

export default Footer;
