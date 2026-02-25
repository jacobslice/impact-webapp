import Image from "next/image";

export function Footer() {
  return (
    <footer className="text-center py-6 border-t border-white/[0.03] mt-6">
      <div className="flex items-center justify-center gap-4 text-white/35 text-[10.5px]">
        <Image
          src="/images/slice-logo.png"
          alt="Slice Analytics"
          width={80}
          height={26}
          className="opacity-60 hover:opacity-80 transition-opacity"
        />
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-white/35 text-[10px]">Powered by</span>
          <Image
            src="/images/dune-logo.png"
            alt="Dune"
            width={60}
            height={20}
            className="opacity-60 hover:opacity-80 transition-opacity"
          />
        </div>
      </div>
    </footer>
  );
}
