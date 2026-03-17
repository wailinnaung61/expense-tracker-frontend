import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { CategoriesHeader } from "@/components/categories/categories-header";
import { CategoriesTable } from "@/components/categories/categories";
import { CategoryFilters } from "@/components/categories/category-filters";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory } from "@/types/category";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import spinnerGif from "@/assets/Spinner.gif";

export default function Categories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null); 

  const pageSize = 10;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params: any = {
        pagination: {
          pageNumber: currentPage,
          pageSize,
        },
      };

      if (type !== "all") {
        params.type = type;
      }

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = await categoryService.getCategories(params);
      setCategories(response.items);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch categories",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, type, keyword]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setCurrentPage(1);
  };

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEditClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <CategoriesHeader onAddClick={handleAddClick} />
      
      <CategoryFilters
        type={type}
        keyword={keyword}
        onTypeChange={handleTypeChange}
        onKeywordChange={handleKeywordChange}
      />

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <img src={spinnerGif} alt="Loading" className="w-12 h-12" />
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onEdit={handleEditClick}
          onDelete={fetchCategories}
        />
      )}

      <AddCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        category={selectedCategory}
      />
    </div>
  );
}
