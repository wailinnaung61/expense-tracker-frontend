import { apiClient } from "@/lib/api";
import type {
  CreateExportRequest,
  ExportJobResponse,
  ExportDownloadResponse,
} from "@/types/export";

class ExportService {
  private readonly baseUrl = "/api/export";
  private readonly POLL_INTERVAL = 2000; // Poll every 2 seconds
  private readonly MAX_POLL_TIME = 300000; // 5 minutes timeout

  /**
   * Step 1: Request async Excel export
   */
  async requestExport(request: CreateExportRequest): Promise<ExportJobResponse> {
    const response = await apiClient.request<ExportJobResponse>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(request),
    });
    return response;
  }

  /**
   * Step 2: Poll job status until completion
   */
  async pollJobStatus(jobId: string): Promise<ExportJobResponse> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > this.MAX_POLL_TIME) {
            reject(new Error("Export timeout: The export is taking longer than expected. Please try again later."));
            return;
          }

          const status = await this.getJobStatus(jobId);
          const statusUpper = status.status.toUpperCase();

          if (statusUpper === "COMPLETED") {
            resolve(status);
            return;
          }

          if (statusUpper === "FAILED") {
            reject(new Error("Export failed: The export process encountered an error. Please try again."));
            return;
          }

          // Still pending or processing, continue polling
          setTimeout(poll, this.POLL_INTERVAL);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ExportJobResponse> {
    const response = await apiClient.request<ExportJobResponse>(
      `${this.baseUrl}/${jobId}`,
      { method: "GET" }
    );
    return response;
  }

  /**
   * Step 3: Get download URL
   */
  async getDownloadUrl(jobId: string): Promise<ExportDownloadResponse> {
    const response = await apiClient.request<ExportDownloadResponse>(
      `${this.baseUrl}/${jobId}/download`,
      { method: "GET" }
    );
    return response;
  }

  /**
   * Complete export flow: Request → Poll → Download
   */
  async exportAndDownload(
    request: CreateExportRequest
  ): Promise<void> {
    try {
      // Step 1: Request export
      const job = await this.requestExport(request);

      // Step 2: Poll until complete
      const completedJob = await this.pollJobStatus(job.jobId);

      // Step 3: Get download URL
      const downloadData = await this.getDownloadUrl(completedJob.jobId);

      // Step 4: Trigger download
      const link = document.createElement("a");
      link.href = downloadData.downloadUrl;
      link.download = downloadData.fileName || "export.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
