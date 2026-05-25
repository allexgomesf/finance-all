import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rotas acessíveis sem autenticação. */
const PUBLIC_PATHS = ["/", "/login", "/forgot-password"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/convite")
  );
}

/**
 * Renova a sessão do Supabase a cada request e protege as rotas privadas.
 * Deve ser chamado pelo middleware raiz.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: não execute código entre createServerClient e getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Sem sessão tentando acessar rota privada -> redireciona para /login.
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Com sessão tentando acessar login/cadastro -> redireciona para /dashboard.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
