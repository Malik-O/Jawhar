import Navbar from '../components/Navbar';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#101010]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
