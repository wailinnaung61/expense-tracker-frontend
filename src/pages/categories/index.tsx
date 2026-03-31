import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { CategoriesHeader } from "@/components/categories/categories-header";
import { CategoriesTable } from "@/components/categories/categories";
import { CategoryFilters } from "@/components/categories/category-filters";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory, CategoryListParams } from "@/types/category";
import { useEffect, useState, useCallback } from "react";
import spinnerGif from "@/assets/Spinner.gif";
import { CHATBOT_REFRESH_EVENT, type ChatbotRefreshEventDetail } from "@/lib/chatbot-refresh";

export default function Categories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextCursorId, setNextCursorId] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentCursorId, setCurrentCursorId] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<{cursor: string | null, cursorId: string | null}>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pageSize = 10;

  const fetchCategories = useCallback(async (cursor: string | null = null, cursorId: string | null = null) => {
    setLoading(true);
    try {
      const params: CategoryListParams = {
        pageSize,
      };

      if (type !== "all") {
        params.type = type;
      }

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      if (cursor) {
        params.cursor = cursor;
      }

      if (cursorId) {
        params.cursorId = cursorId;
      }

      const response = await categoryService.getCategories(params);
      setCategories(response.items);
      setTotalCount(response.totalCount);
      setNextCursor(response.nextCursor || null);
      setNextCursorId(response.nextCursorId || null);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error("Failedto  fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [type, keyword]);

  useEffect(() => {
    fetchCategories(currentCursor, currentCursorId);
  }, [fetchCategories, currentCursor, currentCursorId, refreshKey]);

  useEffect(() => {
    const onChatbotRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<ChatbotRefreshEventDetail>;
      if (customEvent.detail?.target === "categories") {
        setCurrentPage(1);
        setCurrentCursor(null);
        setCurrentCursorId(null);
        setCursorHistory([]);
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    return () => {
      window.removeEventListener(CHATBOT_REFRESH_EVENT, onChatbotRefresh as EventListener);
    };
  }, []);

  const handleTypeChange = useCallback((newType: string) => {
    setType(newType);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
  }, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage && nextCursor && nextCursorId) {
      setCursorHistory(prev => [...prev, {cursor: currentCursor, cursorId: currentCursorId}]);
      setCurrentPage(prev => prev + 1);
      setCurrentCursor(nextCursor);
      setCurrentCursorId(nextCursorId);
    }
  }, [hasNextPage, nextCursor, nextCursorId, currentCursor, currentCursorId]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursors = newHistory.pop();
      setCursorHistory(newHistory);
      setCurrentPage(prev => prev - 1);
      setCurrentCursor(prevCursors?.cursor || null);
      setCurrentCursorId(prevCursors?.cursorId || null);
    }
  }, [cursorHistory]);

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
    setCurrentCursor(null);
    setCurrentCursorId(null);
    setCursorHistory([]);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <CategoriesHeader onAddClick={handleAddClick} onRefresh={handleDialogSuccess} />
      
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
          hasPreviousPage={cursorHistory.length > 0}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onEdit={handleEditClick}
          onDelete={handleDeleteSuccess}
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
