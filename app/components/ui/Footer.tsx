import { QrCode } from "lucide-react";

const Footer = () => {
  return (
    <footer className="h-12 bg-blue-500 text-white flex items-center justify-center gap-2">
      <span className="font-semibold tracking-wide">SCAN</span>
      <QrCode size={20} />
    </footer>
  );
};

export default Footer;
