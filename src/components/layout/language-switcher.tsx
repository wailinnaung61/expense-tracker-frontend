import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import US from 'country-flag-icons/react/3x2/US';
import MM from 'country-flag-icons/react/3x2/MM';
import JP from 'country-flag-icons/react/3x2/JP';

const languages = [
  { code: 'en', name: 'English', Flag: US },
  { code: 'my', name: 'မြန်မာ', Flag: MM },
  { code: 'ja', name: '日本語', Flag: JP },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { fetchUser, isAuthenticated } = useAuth();

  const changeLanguage = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    
    // Refetch user data to get localized menu items
    if (isAuthenticated) {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Failed to refresh user data after language change:', error);
      }
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const CurrentFlag = currentLanguage.Flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 bg-muted/30 hover:bg-muted">
          <CurrentFlag className="h-4 w-5 rounded-sm border border-border/50" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {languages.map((lang) => {
          const FlagComponent = lang.Flag;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={i18n.language === lang.code ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}
            >
              <FlagComponent className="mr-2 h-4 w-5 rounded-sm border border-border/50" />
              {lang.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
