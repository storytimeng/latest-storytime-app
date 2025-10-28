import { Navbar } from "@/components/reusables";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className=" bg-accent-shade-1">
      {children}
      <Navbar />
    </section>
  );
}
