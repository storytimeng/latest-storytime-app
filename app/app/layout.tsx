import { Navbar } from "@/components/reusables";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      {children}
      <Navbar />
    </section>
  );
}
