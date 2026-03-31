import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { investmentService } from "@/services/investmentService";
import { AssetType, InvestmentStatus } from "@/types/investment";
import type { Investment, InvestmentPortfolio } from "@/types/investment";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { z } from "zod";

interface AddInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  investment?: Investment | null;
  portfolios: InvestmentPortfolio[];
}

const investmentSchema = z.object({
  portfolioId: z.string().optional(),
  assetType: z.string().min(1, "Asset type is required"),
  assetName: z
    .string()
    .min(1, "Asset name is required")
    .max(200, "Asset name must not exceed 200 characters"),
  symbol: z.string().optional(),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be greater than 0",
    }),
  purchasePrice: z
    .string()
    .min(1, "Purchase price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Purchase price must be greater than 0",
    }),
  currentPrice: z
    .string()
    .min(1, "Current price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Current price must be 0 or greater",
    }),
  purchaseDate: z.date(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

const ASSET_TYPE_MAP: Record<string, number> = {
  STOCK: AssetType.Stock,
  CRYPTO: AssetType.Crypto,
  BOND: AssetType.Bond,
  MUTUALFUND: AssetType.MutualFund,
  REALESTATE: AssetType.RealEstate,
  GOLD: AssetType.Gold,
  OTHER: AssetType.Other,
};

const STATUS_MAP: Record<string, number> = {
  HOLDING: InvestmentStatus.Holding,
  SOLD: InvestmentStatus.Sold,
  PARTIALSOLD: InvestmentStatus.PartialSold,
};

export function AddInvestmentDialog({
  open,
  onOpenChange,
  onSuccess,
  investment,
  portfolios,
}: AddInvestmentDialogProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      portfolioId: "none",
      assetType: String(AssetType.Stock),
      assetName: "",
      symbol: "",
      quantity: "",
      purchasePrice: "",
      currentPrice: "",
      purchaseDate: new Date(),
      status: String(InvestmentStatus.Holding),
      notes: "",
    },
  });

  useEffect(() => {
    if (investment) {
      reset({
        portfolioId: investment.portfolioId || "none",
        assetType: String(ASSET_TYPE_MAP[investment.assetType.toUpperCase()] ?? AssetType.Stock),
        assetName: investment.assetName,
        symbol: investment.symbol || "",
        quantity: String(investment.quantity),
        purchasePrice: String(investment.purchasePrice),
        currentPrice: String(investment.currentPrice),
        purchaseDate: new Date(investment.purchaseDate),
        status: String(STATUS_MAP[investment.status.toUpperCase()] ?? InvestmentStatus.Holding),
        notes: investment.notes || "",
      });
    } else {
      reset({
        portfolioId: "none",
        assetType: String(AssetType.Stock),
        assetName: "",
        symbol: "",
        quantity: "",
        purchasePrice: "",
        currentPrice: "",
        purchaseDate: new Date(),
        status: String(InvestmentStatus.Holding),
        notes: "",
      });
    }
  }, [investment, open, reset]);

  const onSubmit = async (data: InvestmentFormData) => {
    try {
      const portfolioValue = data.portfolioId === "none" ? undefined : data.portfolioId;
      if (investment) {
        await investmentService.updateInvestment(investment.investmentId, {
          portfolioId: portfolioValue,
          assetName: data.assetName.trim(),
          symbol: data.symbol?.trim() || "",
          quantity: Number(data.quantity),
          purchasePrice: Number(data.purchasePrice),
          currentPrice: Number(data.currentPrice),
          purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
          status: Number(data.status) as InvestmentStatus,
          notes: data.notes || "",
          imageUrl: investment.imageUrl || "",
        });
        await Swal.fire({
          icon: "success",
          title: t("investments.feedback.updated"),
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await investmentService.createInvestment({
          portfolioId: portfolioValue,
          assetType: Number(data.assetType) as AssetType,
          assetName: data.assetName.trim(),
          symbol: data.symbol?.trim() || "",
          quantity: Number(data.quantity),
          purchasePrice: Number(data.purchasePrice),
          currentPrice: Number(data.currentPrice),
          purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
          notes: data.notes || "",
          imageUrl: "",
        });
        await Swal.fire({
          icon: "success",
          title: t("investments.feedback.created"),
          timer: 2000,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(investment ? "investments.feedback.updateFailed" : "investments.feedback.createFailed")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{investment ? t("investments.dialog.editTitle") : t("investments.dialog.addTitle")}</DialogTitle>
          <DialogDescription>
            {investment
              ? t("investments.dialog.editDescription")
              : t("investments.dialog.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="assetName">{t("investments.dialog.assetName")} *</Label>
            <Input
              id="assetName"
              placeholder={t("investments.dialog.assetNamePlaceholder")}
              {...register("assetName")}
            />
            {errors.assetName && (
              <p className="text-sm text-red-600">{errors.assetName.message}</p>
            )}
          </div>

          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">{t("investments.dialog.symbol")}</Label>
            <Input id="symbol" placeholder={t("investments.dialog.symbolPlaceholder")} {...register("symbol")} />
          </div>

          {/* Asset Type */}
          {!investment && (
            <div className="space-y-2">
              <Label>{t("investments.dialog.assetType")} *</Label>
              <Controller
                name="assetType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("investments.dialog.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(AssetType.Stock)}>{t("investments.filters.stock")}</SelectItem>
                      <SelectItem value={String(AssetType.Crypto)}>{t("investments.filters.crypto")}</SelectItem>
                      <SelectItem value={String(AssetType.Bond)}>{t("investments.filters.bond")}</SelectItem>
                      <SelectItem value={String(AssetType.MutualFund)}>{t("investments.filters.mutualFund")}</SelectItem>
                      <SelectItem value={String(AssetType.RealEstate)}>{t("investments.filters.realEstate")}</SelectItem>
                      <SelectItem value={String(AssetType.Gold)}>{t("investments.filters.gold")}</SelectItem>
                      <SelectItem value={String(AssetType.Other)}>{t("investments.filters.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assetType && (
                <p className="text-sm text-red-600">{errors.assetType.message}</p>
              )}
            </div>
          )}

          {/* Portfolio */}
          {portfolios.length > 0 && (
            <div className="space-y-2">
              <Label>{t("investments.dialog.portfolio")}</Label>
              <Controller
                name="portfolioId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("investments.dialog.noPortfolio")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("investments.dialog.noPortfolio")}</SelectItem>
                      {portfolios.map((p) => (
                        <SelectItem key={p.portfolioId} value={p.portfolioId}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Quantity + Purchase Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("investments.dialog.quantity")} *</Label>
              <Input id="quantity" type="number" step="any" placeholder="0" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">{t("investments.dialog.purchasePrice")} *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="any"
                placeholder="0.00"
                {...register("purchasePrice")}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-600">{errors.purchasePrice.message}</p>
              )}
            </div>
          </div>

          {/* Current Price */}
          <div className="space-y-2">
            <Label htmlFor="currentPrice">{t("investments.dialog.currentPrice")} *</Label>
            <Input
              id="currentPrice"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("currentPrice")}
            />
            {errors.currentPrice && (
              <p className="text-sm text-red-600">{errors.currentPrice.message}</p>
            )}
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label>{t("investments.dialog.purchaseDate")} *</Label>
            <Controller
              name="purchaseDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : t("investments.dialog.pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.purchaseDate && (
              <p className="text-sm text-red-600">{errors.purchaseDate.message}</p>
            )}
          </div>

          {/* Status (edit only) */}
          {investment && (
            <div className="space-y-2">
              <Label>{t("investments.dialog.status")}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("investments.dialog.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(InvestmentStatus.Holding)}>{t("investments.filters.holding")}</SelectItem>
                      <SelectItem value={String(InvestmentStatus.Sold)}>{t("investments.filters.sold")}</SelectItem>
                      <SelectItem value={String(InvestmentStatus.PartialSold)}>
                        {t("investments.filters.partialSold")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("investments.dialog.notes")}</Label>
            <Textarea id="notes" placeholder={t("investments.dialog.notesPlaceholder")} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("investments.dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {investment ? t("investments.dialog.update") : t("investments.dialog.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
