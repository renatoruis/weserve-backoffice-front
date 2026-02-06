import { auth0 } from "@/lib/auth0";

export default async function UnauthorizedPage() {
  const session = await auth0.getSession();
  const email = session?.user?.email || "Unknown";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2 text-gray-900">
          Acesso Negado
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          O email <strong className="text-gray-700">{email}</strong> não tem
          permissão para acessar o painel administrativo.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Contacte o administrador para solicitar acesso.
        </p>
        <a
          href="/auth/logout"
          className="block w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Sair e tentar com outra conta
        </a>
      </div>
    </div>
  );
}
