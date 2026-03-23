import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { CategoriesHeader } from "@/components/categories/categories-header";
import { CategoriesTable } from "@/components/categories/categories";
import { CategoryFilters } from "@/components/categories/category-filters";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, CategoryListParams } from "@/types/category";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import spinnerGif from "@/assets/Spinner.gif";

export default function Categories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [tokenHistory, setTokenHistory] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null); 

  const pageSize = 10;

  const fetchCategories = useCallback(async (token: string | null = null) => {
    setLoading(true);
    try {
      const params: CategoryListParams = {
        pagination: {
          pageNumber: currentPage,
          pageSize,
          nextPageToken: token || undefined,
          hasCursor: !!token,
        },
      };

      if (type !== "all") {
        params.type = type;
      }

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = await categoryService.getCategories(params);
      
      // Remove duplicates by categoryId - O(n) using Map
      const seen = new Map<string, ExpenseCategory>();
      (response.items || []).forEach(cat => {
        if (!seen.has(cat.categoryId)) {
          seen.set(cat.categoryId, cat);
        }
      });
      
      setCategories(Array.from(seen.values()));
      setTotalCount(response.totalCount);
      setNextPageToken(response.nextPageToken || null);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch categories";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  }, [type, keyword, currentPage]);

  useEffect(() => {
    fetchCategories(currentToken);
  }, [fetchCategories, currentToken]);

  const handleTypeChange = useCallback((newType: string) => {
    setType(newType);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage && nextPageToken) {
      setTokenHistory(prev => [...prev, currentToken || '']);
      setCurrentPage(prev => prev + 1);
      setCurrentToken(nextPageToken);
    }
  }, [hasNextPage, nextPageToken, currentToken]);

  const handlePreviousPage = useCallback(() => {
    if (tokenHistory.length > 0) {
      const newHistory = [...tokenHistory];
      const prevToken = newHistory.pop();
      setTokenHistory(newHistory);
      setCurrentPage(prev => prev - 1);
      setCurrentToken(prevToken || null);
    }
  }, [tokenHistory]);

  const handleAddClick = useCallback(() => {
    setSelectedCategory(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((category: ExpenseCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setCurrentPage(1);
    setCurrentToken(null);
    setTokenHistory([]);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchCategories(currentToken);
  }, [fetchCategories, currentToken]);

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
          currentPage={currentPage}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={tokenHistory.length > 0}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onEdit={handleEditClick}
          onDelete={handleRefresh}
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
