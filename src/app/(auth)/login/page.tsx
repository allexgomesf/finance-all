import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getLoginPageText } from "@/lib/data/page-texts";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <LoginArtPanel />

      {/* Form side */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-16">
        {/* Logo visible only on mobile (left panel hidden below lg) */}
        <div className="mb-8 flex items-center lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-financeall.svg"
            alt="FinanceAll"
            className="h-7 w-auto select-none"
            draggable={false}
          />
        </div>
        <AuthForm />
      </div>
    </div>
  );
}

async function LoginArtPanel() {
  const loginText = await getLoginPageText();
  const tagline = loginText.title ?? "Suas finanças, sob controle.";
  const taglineSubtitle =
    loginText.subtitle ?? "Gerencie projetos, clientes e receitas em um só lugar.";
  const chartPath =
    "M 0,188 C 40,182 68,172 90,168 S 140,154 165,146 S 202,128 228,120 " +
    "S 268,104 294,97 S 328,82 353,74 S 388,59 413,51 " +
    "S 448,38 473,31 S 508,21 532,16 L 560,13";
  const areaPath =
    chartPath + " L 560,220 L 0,220 Z";

  const dots: [number, number][] = [
    [90, 168],
    [228, 120],
    [353, 74],
    [473, 31],
    [560, 13],
  ];

  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
      style={{ background: "oklch(0.205 0.008 320)" }}
    >
      {/* Subtle dot grid */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="login-dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="14" cy="14" r="0.75" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dots)" />
      </svg>

      {/* Decorative accent rings — bottom-right */}
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 size-[520px] rounded-full"
        style={{ border: "1px solid rgba(238,50,142,0.13)" }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-20 size-[320px] rounded-full"
        style={{ border: "1px solid rgba(238,50,142,0.07)" }}
      />

      {/* Top: Logo */}
      <div className="relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-financeall.svg"
          alt="FinanceAll"
          className="h-7 w-auto select-none"
          draggable={false}
        />
      </div>

      {/* Middle: Animated chart + stat cards */}
      <div className="relative z-10">
        <div className="relative">
          <svg
            viewBox="0 0 560 220"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden="true"
            overflow="visible"
          >
            <defs>
              <linearGradient
                id="login-stroke-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ee328e" stopOpacity="0.3" />
                <stop offset="55%" stopColor="#ee328e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="1" />
              </linearGradient>
              <linearGradient
                id="login-area-grad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ee328e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ee328e" stopOpacity="0" />
              </linearGradient>
              <filter id="login-glow" x="-25%" y="-60%" width="150%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Area fill under the curve */}
            <path d={areaPath} fill="url(#login-area-grad)" />

            {/* Main line */}
            <path
              d={chartPath}
              fill="none"
              stroke="url(#login-stroke-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#login-glow)"
              className="login-chart-line"
            />

            {/* Data point dots */}
            {dots.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#ee328e"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.5"
                className="login-art-dot"
                style={{ animationDelay: `${0.55 + i * 0.18}s` }}
              />
            ))}
          </svg>

          {/* Stat card — top-right */}
          <div
            className="login-art-card absolute right-1 top-0 min-w-[158px] rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(14px)",
              animationDelay: "1.05s",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.48)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              Receita MRR
            </p>
            <p
              style={{
                color: "#fff",
                fontSize: "19px",
                fontWeight: 600,
                marginTop: "3px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              R$&nbsp;124.500
            </p>
            <p style={{ color: "rgb(52,211,153)", fontSize: "11px", marginTop: "3px" }}>
              ↑ 12,4% este mês
            </p>
          </div>

          {/* Stat card — left, mid-chart */}
          <div
            className="login-art-card absolute left-0 top-10 min-w-[148px] rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(14px)",
              animationDelay: "1.35s",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.48)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              Projetos ativos
            </p>
            <p
              style={{
                color: "#fff",
                fontSize: "19px",
                fontWeight: 600,
                marginTop: "3px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              48
            </p>
            <p style={{ color: "rgb(52,211,153)", fontSize: "11px", marginTop: "3px" }}>
              ↑ 3 novos hoje
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Tagline */}
      <div className="relative z-10">
        <p
          className="text-[1.75rem] font-semibold leading-snug tracking-tight"
          style={{ color: "#fff" }}
        >
          {tagline}
        </p>
        <p
          className="mt-2.5 text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          {taglineSubtitle}
        </p>
      </div>
    </div>
  );
}
