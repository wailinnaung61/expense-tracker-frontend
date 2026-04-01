import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { investmentService } from "@/services/investmentService";
import type { InvestmentPortfolio } from "@/types/investment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Edit, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { z } from "zod";

interface InvestmentPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolios: InvestmentPortfolio[];
  onRefresh: () => void;
}

type PortfolioFormData = {
  name: string;
  description?: string;
};

export function InvestmentPortfolioDialog({
  open,
  onOpenChange,
  portfolios,
  onRefresh,
}: InvestmentPortfolioDialogProps) {
  const { t } = useTranslation();
  const [editingPortfolio, setEditingPortfolio] = useState<InvestmentPortfolio | null>(null);
  const [showForm, setShowForm] = useState(false);

  const portfolioSchema = useMemo(() => z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(200, t("validation.nameMax", { max: 200 })),
    description: z.string().optional(),
  }), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (editingPortfolio) {
      reset({ name: editingPortfolio.name, description: editingPortfolio.description || "" });
      setShowForm(true);
    }
  }, [editingPortfolio, reset]);

  useEffect(() => {
    if (!open) {
      setEditingPortfolio(null);
      setShowForm(false);
      reset({ name: "", description: "" });
    }
  }, [open, reset]);

  const handleAddClick = () => {
    setEditingPortfolio(null);
    reset({ name: "", description: "" });
    setShowForm(true);
  };

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      if (editingPortfolio) {
        await investmentService.updatePortfolio(editingPortfolio.portfolioId, {
          name: data.name.trim(),
          description: data.description || "",
          isActive: editingPortfolio.isActive,
        });
        toast.success(t("investments.feedback.portfolioUpdated"));
      } else {
        await investmentService.createPortfolio({
          name: data.name.trim(),
          description: data.description || "",
        });
        toast.success(t("investments.feedback.portfolioCreated"));
      }
      setShowForm(false);
      setEditingPortfolio(null);
      reset({ name: "", description: "" });
      onRefresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(editingPortfolio ? "investments.feedback.portfolioUpdateFailed" : "investments.feedback.portfolioCreateFailed")
      );
    }
  };

  const handleDelete = async (portfolio: InvestmentPortfolio) => {
    // Close dialog first so Swal is not blocked by Radix focus trap
    onOpenChange(false);

    const result = await Swal.fire({
      title: t("investments.feedback.confirmDeletePortfolioTitle"),
      text: t("investments.feedback.confirmDeletePortfolioText", { name: portfolio.name }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("investments.feedback.confirmButton"),
      cancelButtonText: t("investments.feedback.cancelButton"),
    });

    if (result.isConfirmed) {
      try {
        await investmentService.deletePortfolio(portfolio.portfolioId);
        toast.success(t("investments.feedback.portfolioDeleted"));
        onRefresh();
        return; // Stay closed after delete
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : t("investments.feedback.portfolioDeleteFailed"));
      }
    }

    // Reopen dialog if cancelled or error
    onOpenChange(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("investments.portfolio.title")}</DialogTitle>
          <DialogDescription>{t("investments.portfolio.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Portfolio List */}
          {portfolios.length > 0 ? (
            <div className="space-y-2">
              {portfolios.map((p) => (
                <div
                  key={p.portfolioId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingPortfolio(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t("investments.portfolio.noPortfolios")}</p>
          )}

          {/* Add / Edit Form */}
          {showForm ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="pName">{t("investments.portfolio.name")} *</Label>
                <Input id="pName" placeholder={t("investments.portfolio.namePlaceholder")} {...register("name")} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pDesc">{t("investments.portfolio.descriptionField")}</Label>
                <Textarea id="pDesc" placeholder={t("investments.portfolio.descriptionPlaceholder")} {...register("description")} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPortfolio(null);
                    reset({ name: "", description: "" });
                  }}
                >
                  {t("investments.portfolio.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPortfolio ? t("investments.portfolio.update") : t("investments.portfolio.create")}
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("investments.portfolio.addPortfolio")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
