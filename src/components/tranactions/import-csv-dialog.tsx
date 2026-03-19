import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionService } from "@/services/tranactionService";
import { categoryService } from "@/services/categoryService";
import type { ExpenseCategory } from "@/types/category";
import { TransactionType, PaymentStatus } from "@/types/transaction";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { parse } from "date-fns";

interface ImportCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedRow {
  rowNumber: number;
  type: string;
  category: string;
  amount: string;
  date: string;
  status: string;
  description: string;
  note: string;
  valid: boolean;
  errors: string[];
}

export function ImportCsvDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCsvDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          pagination: {
            pageNumber: 1,
            pageSize: 999999999,
          },
        });
        setCategories(response.items || []);
      } catch (error) {
        // Silent fail
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setParsedData([]);
      setValidCount(0);
      setInvalidCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some((field) => field !== "")) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = "";
        }
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field !== "")) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const findCategoryByName = (name: string): ExpenseCategory | undefined => {
    const normalized = name.toLowerCase().trim();
    return categories.find(
      (cat) => cat.displayName.toLowerCase() === normalized || cat.categoryId === name
    );
  };

  const parseTransactionType = (value: string): number | null => {
    const normalized = value.toLowerCase().trim();
    if (normalized === "expense" || normalized === "1") return TransactionType.Expense;
    if (normalized === "income" || normalized === "0") return TransactionType.Income;
    return null;
  };

  const parsePaymentStatus = (value: string): number | null => {
    const normalized = value.toLowerCase().trim();
    if (normalized === "pending" || normalized === "0") return PaymentStatus.Pending;
    if (normalized === "completed" || normalized === "1") return PaymentStatus.Completed;
    if (normalized === "failed" || normalized === "2") return PaymentStatus.Failed;
    return null;
  };

  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    
    // Try common date formats
    const formats = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd/MM/yyyy",
      "yyyy/MM/dd",
      "MM-dd-yyyy",
      "dd-MM-yyyy",
    ];

    for (const formatStr of formats) {
      try {
        const parsed = parse(value.trim(), formatStr, new Date());
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    return null;
  };

  const validateAndParseRow = (row: string[], rowNumber: number): ParsedRow => {
    const errors: string[] = [];
    const parsedRow: ParsedRow = {
      rowNumber,
      type: row[0] || "",
      category: row[1] || "",
      amount: row[2] || "",
      date: row[3] || "",
      status: row[4] || "Completed",
      description: row[5] || "",
      note: row[6] || "",
      valid: true,
      errors: [],
    };

    // Validate type
    const typeValue = parseTransactionType(parsedRow.type);
    if (typeValue === null) {
      errors.push("Invalid type (use 'Income', 'Expense', '0', or '1')");
    }

    // Validate category
    const category = findCategoryByName(parsedRow.category);
    if (!category) {
      errors.push(`Category '${parsedRow.category}' not found`);
    } else if (typeValue !== null && category.type !== typeValue) {
      errors.push(`Category type mismatch`);
    }

    // Validate amount
    const amount = parseFloat(parsedRow.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push("Invalid amount (must be > 0)");
    }

    // Validate date
    const parsedDate = parseDate(parsedRow.date);
    if (!parsedDate) {
      errors.push("Invalid date format");
    }

    // Validate status
    const statusValue = parsePaymentStatus(parsedRow.status);
    if (statusValue === null) {
      errors.push("Invalid status");
    }

    parsedRow.valid = errors.length === 0;
    parsedRow.errors = errors;

    return parsedRow;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select a CSV file",
      });
      return;
    }

    setSelectedFile(file);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Empty File",
          text: "The CSV file is empty",
        });
        return;
      }

      // Skip header row if it looks like a header
      const firstRow = rows[0];
      const hasHeader =
        firstRow.some((cell) =>
          ["type", "category", "amount", "date", "status"].includes(cell.toLowerCase())
        );
      const dataRows = hasHeader ? rows.slice(1) : rows;

      // Parse and validate each row
      const parsed = dataRows.map((row, index) => validateAndParseRow(row, index + (hasHeader ? 2 : 1)));

      setParsedData(parsed);
      setValidCount(parsed.filter((r) => r.valid).length);
      setInvalidCount(parsed.filter((r) => !r.valid).length);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Parse Error",
        text: "Failed to parse CSV file",
      });
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.valid);

    if (validRows.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Valid Rows",
        text: "There are no valid rows to import",
      });
      return;
    }

    setIsImporting(true);
    try {
      // Import all valid transactions
      await Promise.all(
        validRows.map((row) => {
          const category = findCategoryByName(row.category)!;
          const type = parseTransactionType(row.type)!;
          const status = parsePaymentStatus(row.status)!;
          const date = parseDate(row.date)!;

          return transactionService.createTransaction({
            type: type as TransactionType,
            categoryId: category.categoryId,
            amount: parseFloat(row.amount),
            tranactionDate: date.toISOString(),
            status: status as PaymentStatus,
            description: row.description.trim(),
            note: row.note.trim(),
            imageUrl: "",
          });
        })
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${validRows.length} transaction(s) imported successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: error.message || "Failed to import transactions",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Type,Category,Amount,Date,Status,Description,Note
Expense,Food,25.50,2026-03-18,Completed,Lunch at cafe,
Income,Salary,3000.00,2026-03-01,Completed,Monthly salary,
Expense,Transport,15.00,2026-03-17,Completed,Bus fare,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaction-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple transactions at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {/* File Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload CSV file"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or drag and drop your file here
                </p>
              </div>
            </label>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download a sample CSV file to get started
                </p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              Download Template
            </Button>
          </div>

          {/* Preview Stats */}
          {parsedData.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{parsedData.length}</p>
                    <p className="text-xs text-blue-600">Total Rows</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                    <p className="text-xs text-green-600">Valid</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
                    <p className="text-xs text-red-600">Invalid</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="border rounded-lg overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`border-b ${row.valid ? "" : "bg-red-50 dark:bg-red-950/20"}`}
                    >
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">{row.type}</td>
                      <td className="p-2">{row.category}</td>
                      <td className="p-2">{row.amount}</td>
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">{row.status}</td>
                      <td className="p-2">
                        {row.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-red-600">
                              {row.errors.join(", ")}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CSV Format Info */}
          {parsedData.length === 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="font-medium text-sm">CSV Format:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong>Type:</strong> "Income", "Expense", "0" (Income), or "1" (Expense)
                </li>
                <li>
                  <strong>Category:</strong> Category name (must exist in your categories)
                </li>
                <li>
                  <strong>Amount:</strong> Numeric value (e.g., 25.50)
                </li>
                <li>
                  <strong>Date:</strong> YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY
                </li>
                <li>
                  <strong>Status:</strong> "Pending", "Completed", "Failed", "0", "1", or "2"
                </li>
                <li>
                  <strong>Description:</strong> Optional description text
                </li>
                <li>
                  <strong>Note:</strong> Optional note text
                </li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isImporting}
          >
            {isImporting ? "Importing..." : `Import ${validCount} Transaction(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
