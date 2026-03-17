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

interface CategoriesTableProps {
  categories: ExpenseCategory[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: () => void;
}

const getTypeLabel = (type: TransactionType): string => {
  const labels: Record<number, string> = {
    0: "Income",
    1: "Expense",
    2: "Investment",
    3: "Savings",
  };
  return labels[type] || "Unknown";
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
  totalPages,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const handleDelete = async (category: ExpenseCategory) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${category.displayName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await categoryService.deleteCategory(category.categoryId);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Category has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
        onDelete();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete category",
        });
      }
    }
  };

  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No categories found.</p>
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
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center">
          <span className="text-sm text-muted-foreground mb-1 md:mb-0">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-1 py-2 rtl:rotate-180"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Smart pagination logic */}
            {(() => {
              const pages: (number | string)[] = [];
              const showEllipsisStart = currentPage > 3;
              const showEllipsisEnd = currentPage < totalPages - 2;

              // Always show first page
              pages.push(1);

              // Show ellipsis after first page
              if (showEllipsisStart) {
                pages.push('...');
              }

              // Show pages around current page
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);
              
              for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                  pages.push(i);
                }
              }

              // Show ellipsis before last page
              if (showEllipsisEnd) {
                pages.push('...');
              }

              // Always show last page (if more than 1 page)
              if (totalPages > 1) {
                pages.push(totalPages);
              }

              return pages.map((page, idx) =>
                typeof page === 'number' ? (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="px-2 py-2 min-w-8"
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground">
                    {page}
                  </span>
                )
              );
            })()}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-1 py-2 rtl:rotate-180"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
