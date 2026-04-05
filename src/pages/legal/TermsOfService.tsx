import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legal.terms.acceptance"), content: t("legal.terms.acceptanceDesc") },
    { title: t("legal.terms.accounts"), content: t("legal.terms.accountsDesc") },
    { title: t("legal.terms.useOfService"), content: t("legal.terms.useOfServiceDesc") },
    { title: t("legal.terms.intellectualProperty"), content: t("legal.terms.intellectualPropertyDesc") },
    { title: t("legal.terms.limitation"), content: t("legal.terms.limitationDesc") },
    { title: t("legal.terms.termination"), content: t("legal.terms.terminationDesc") },
    { title: t("legal.terms.changes"), content: t("legal.terms.changesDesc") },
    { title: t("legal.terms.governingLaw"), content: t("legal.terms.governingLawDesc") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t("legal.backToHome")}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("legal.terms.title")}</h1>
        <p className="text-sm text-gray-500 mb-10">{t("legal.terms.lastUpdated")}</p>
        <p className="text-gray-600 leading-relaxed mb-8">{t("legal.terms.intro")}</p>
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
