export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-3xl text-[#2C2420] font-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Access denied
        </h1>
        <p className="text-[#8B7355] mb-6">Your email isn&apos;t on the admin list.</p>
        <a href="/admin/login" className="text-[#C4714A] hover:underline text-sm font-medium">
          Try a different email →
        </a>
      </div>
    </main>
  );
}
