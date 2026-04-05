import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legal.cookies.whatAreCookies"), content: t("legal.cookies.whatAreCookiesDesc") },
    { title: t("legal.cookies.howWeUse"), content: t("legal.cookies.howWeUseDesc") },
    { title: t("legal.cookies.types"), content: t("legal.cookies.typesDesc") },
    { title: t("legal.cookies.managing"), content: t("legal.cookies.managingDesc") },
    { title: t("legal.cookies.thirdParty"), content: t("legal.cookies.thirdPartyDesc") },
    { title: t("legal.cookies.changes"), content: t("legal.cookies.changesDesc") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t("legal.backToHome")}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("legal.cookies.title")}</h1>
        <p className="text-sm text-gray-500 mb-10">{t("legal.cookies.lastUpdated")}</p>
        <p className="text-gray-600 leading-relaxed mb-8">{t("legal.cookies.intro")}</p>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{`${i + 1}. ${s.title}`}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
