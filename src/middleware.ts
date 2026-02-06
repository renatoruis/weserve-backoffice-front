import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

/**
 * Verifica se o usuário tem permissão para acessar o backoffice.
 * Aceita duas formas (qualquer uma válida libera o acesso):
 *   1. Email está na lista ALLOWED_EMAILS (env var, separado por vírgula)
 *   2. Token contém a role "admin" (configurado via Auth0 Actions)
 */
function isAuthorized(session: { user: Record<string, unknown> }): boolean {
  const email = (session.user.email as string || "").toLowerCase();

  // 1. Verificar lista de emails permitidos
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && allowedEmails.includes(email)) {
    return true;
  }

  // 2. Verificar roles do Auth0 (custom claim)
  const roles = (session.user["https://church-app/roles"] as string[]) || [];
  if (roles.includes("admin")) {
    return true;
  }

  // Se ALLOWED_EMAILS não está configurado e não tem role, negar por padrão
  // Se ALLOWED_EMAILS está vazio e não há roles, permitir (backward compatible)
  if (allowedEmails.length === 0 && roles.length === 0) {
    // Nenhuma restrição configurada — negar acesso por segurança
    return false;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const res = await auth0.middleware(request);

  // Auth routes (/auth/*) são tratadas pelo SDK — retorna direto
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return res;
  }

  // Permitir acesso à página de não autorizado
  if (request.nextUrl.pathname === "/unauthorized") {
    return res;
  }

  // Proteger rotas /dashboard/* — verificar sessão + permissão
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const { origin } = request.nextUrl;
    const session = await auth0.getSession(request);

    if (!session) {
      return NextResponse.redirect(new URL("/", origin));
    }

    if (!isAuthorized(session)) {
      return NextResponse.redirect(new URL("/unauthorized", origin));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
