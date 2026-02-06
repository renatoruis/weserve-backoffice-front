import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full mx-4 text-center">
        <Image src="/favicon.svg" alt="Logo" className="mx-auto mb-6" width={100} height={100} />
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Admin Panel
        </p>
        <a
          href="/auth/login"
          className="block w-full py-3 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
