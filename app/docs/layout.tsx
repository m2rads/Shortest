import { Leftbar } from "@/components/docs/leftbar";
import { Navbar } from "@/components/docs/navbar";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <div className="sm:container mx-auto w-[90vw]">
        <div className="flex items-start gap-8">
          <Leftbar key="leftbar" />
          <div className="flex-[5.25]">{children}</div>
        </div>
      </div>
    </div>
  );
}
