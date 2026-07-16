import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "«ФИНДРАЙВ» — займы под залог автомобилей",
  description:
    "«ФИНДРАЙВ» — быстрые займы под залог автомобилей. Деньги за час, авто остаётся у вас.",
  authors: [{ name: "«ФИНДРАЙВ»" }],
  icons: { icon: "/findrive-mark.svg" },
  openGraph: {
    type: "website",
    title: "«ФИНДРАЙВ» — займы под залог автомобилей",
    description:
      "«ФИНДРАЙВ» — быстрые займы под залог автомобилей. Деньги за час, авто остаётся у вас.",
    images: ["/findrive-logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "«ФИНДРАЙВ» — займы под залог автомобилей",
    description:
      "«ФИНДРАЙВ» — быстрые займы под залог автомобилей. Деньги за час, авто остаётся у вас.",
    images: ["/findrive-logo.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "ООО МКК «ФИНДРАЙВ»",
  description:
    "«ФИНДРАЙВ» — быстрые займы под залог автомобилей. Деньги за час, авто остаётся у вас.",
  email: "findrive78@yandex.ru",
  telephone: "+79219888880",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Санкт-Петербург",
    streetAddress: "улица Салова, дом 70А, офис 310",
    addressCountry: "RU",
  },
  areaServed: "Санкт-Петербург и Ленинградская область",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
