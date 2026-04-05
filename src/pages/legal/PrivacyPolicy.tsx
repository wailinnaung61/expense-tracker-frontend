import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legal.privacy.infoCollect"), content: t("legal.privacy.infoCollectDesc") },
    { title: t("legal.privacy.howWeUse"), content: t("legal.privacy.howWeUseDesc") },
    { title: t("legal.privacy.dataStorage"), content: t("legal.privacy.dataStorageDesc") },
    { title: t("legal.privacy.cookies"), content: t("legal.privacy.cookiesDesc") },
    { title: t("legal.privacy.thirdParty"), content: t("legal.privacy.thirdPartyDesc") },
    { title: t("legal.privacy.yourRights"), content: t("legal.privacy.yourRightsDesc") },
    { title: t("legal.privacy.changes"), content: t("legal.privacy.changesDesc") },
    { title: t("legal.privacy.contact"), content: t("legal.privacy.contactDesc") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t("legal.backToHome")}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("legal.privacy.title")}</h1>
        <p className="text-sm text-gray-500 mb-10">{t("legal.privacy.lastUpdated")}</p>
        <p className="text-gray-600 leading-relaxed mb-8">{t("legal.privacy.intro")}</p>
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
