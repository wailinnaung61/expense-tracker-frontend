import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, TransactionType } from "@/types/category";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Edit, MoreVertical, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "@/hooks/useTranslation";

interface CategoriesTableProps {
  categories: ExpenseCategory[];
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: () => void;
}

// Helper hook to get type labels with i18n
const useTypeLabel = () => {
  const { t } = useTranslation();
  
  return (type: TransactionType): string => {
    const labels: Record<number, string> = {
      0: t('categories.income'),
      1: t('categories.expense'),
      2: t('categories.investment'),
      3: t('categories.savings'),
    };
    return labels[type] || "Unknown";
  };
};

const getTypeBadgeClass = (type: TransactionType): string => {
  const classes: Record<number, string> = {
    0: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    1: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    3: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
  return classes[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
};

export function CategoriesTable({
  categories,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t } = useTranslation();
  const getTypeLabel = useTypeLabel();
  
  const handleDelete = async (category: ExpenseCategory) => {
    const result = await Swal.fire({
      title: t('categories.deleteConfirmTitle'),
      text: t('categories.deleteConfirmMessage', { name: category.displayName }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t('common.yes'),
      cancelButtonText: t('common.cancel'),
    });

    if (result.isConfirmed) {
      try {
        await categoryService.deleteCategory(category.categoryId);
        Swal.fire({
          icon: "success",
          title: t('categories.deleteSuccess'),
          text: t('categories.deleteSuccessMessage'),
          timer: 2000,
          showConfirmButton: false,
        });
        onDelete();
      } catch (error: any) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">{t('categories.noCategories')}</p>
      </div>
    );
  }

  return (
   <div className="p-4 border rounded-lg shadow-sm">
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-accent text-accent-foreground">
            <TableRow>
              <TableHead className="px-4 py-2 font-medium">Category</TableHead>
              <TableHead className="hidden sm:table-cell px-4 py-2 font-medium">Type</TableHead>
              <TableHead className="hidden md:table-cell px-4 py-2 font-medium">Status</TableHead>
              <TableHead className="hidden lg:table-cell px-4 py-2 font-medium">Created</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.categoryId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span
                      className="font-medium"
                      style={{ color: category.color }}
                    >
                      {category.displayName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(
                      category.type
                    )}`}
                  >
                    {getTypeLabel(category.type)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {format(new Date(category.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(hasNextPage || hasPreviousPage) && (
        <div className="flex flex-wrap justify-between items-center">
          <span className="text-sm text-muted-foreground mb-1 md:mb-0">
            Page {currentPage} · {totalCount} items
          </span>
          <div className="flex gap-2">
            {hasPreviousPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousPage}
                className="px-3 py-2 rtl:rotate-180"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                className="px-3 py-2 rtl:rotate-180"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
