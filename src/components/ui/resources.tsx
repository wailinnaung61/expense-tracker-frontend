import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ExternalLink, FileText, Video } from "lucide-react";
import { Link } from "react-router-dom";

export function Resources() {
  const resources = [
    {
      title: "User Guide",
      description: "Comprehensive guide to using all features of the app",
      icon: FileText,
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks",
      icon: Video,
      link: "#",
    },
    {
      title: "Financial Education",
      description: "Articles and resources to improve your financial literacy",
      icon: BookOpen,
      link: "#",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Learning Resources */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-medium tracking-wide">
            Learning Resources
          </h3>
          <p className="text-muted-foreground text-sm"></p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <Card
              key={resource.title}
              className="transition-all hover:border-primary/40"
            >
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="mt-4 w-fit self-center group"
                >
                  <Link to={resource.link}>
                    View
                    <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Financial Calculators */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-medium tracking-wide">
            Financial Calculators
          </h3>
          <p className="text-muted-foreground text-sm"></p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Loan Calculator",
              description: "Calculate loan payments and interest",
            },
            {
              title: "Savings Calculator",
              description: "Plan your savings growth over time",
            },
            {
              title: "Retirement Calculator",
              description: "Estimate retirement savings needs",
            },
            {
              title: "Budget Calculator",
              description: "Create a balanced budget plan",
            },
          ].map((tool) => (
            <Card
              key={tool.title}
              className="hover:border-primary/40 transition-border-primary/40 "
            >
              <CardContent className="py-6 px-5">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{tool.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {tool.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
