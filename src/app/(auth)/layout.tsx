export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations for "wow factor" */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md space-y-8 flex flex-col items-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Bem-vindo ao <span className="text-primary-600">StudyHub</span>
          </h2>
          <p className="mt-2 text-center text-sm text-foreground/60">
            A forma mais inteligente de organizar sua vida universitária.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
