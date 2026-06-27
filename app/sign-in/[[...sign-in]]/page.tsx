import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101010]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF9800]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#E65100]/10 blur-[120px] pointer-events-none" />

      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-[#101010]/40 backdrop-blur-[8px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: {
                background: 'rgba(22,22,22,0.80)',
                backdropFilter: 'blur(24px)',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
