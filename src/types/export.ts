// ── Request to backend ──
export interface CreateExportRequest {
  startMonth: string;
  endMonth: string;
}

// ── Response from backend ──
export interface ExportJobResponse {
  jobId: string;
  status: ExportStatus;
  type: string;
  startMonth: string;
  endMonth: string;
  fileName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export type ExportStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ExportDownloadResponse {
  downloadUrl: string;
  expiresAt: string;
  fileName: string;
}
