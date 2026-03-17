import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = import.meta.env.VITE_S3_RECEIPT_BUCKET || 'aws-expense-tracker-receipts';
const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

// Initialize S3 client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

export const s3Service = {
  /**
   * Upload a receipt image to S3
   * @param file - The file to upload
   * @param userId - User ID for organizing files
   * @returns Promise with the uploaded file URL and key
   */
  async uploadReceipt(file: File, userId?: string): Promise<UploadResult> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const folder = userId ? `receipts/${userId}` : 'receipts/anonymous';
    const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    try {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: file.type,
        // Make the file publicly readable (or use signed URLs for private access)
        ACL: 'public-read',
      });

      await s3Client.send(command);

      // Construct the public URL
      const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error: any) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }
  },

  /**
   * Generate a CloudFront or S3 URL for a given key
   * @param key - The S3 object key
   * @returns The full URL
   */
  getFileUrl(key: string): string {
    // If you have CloudFront distribution, use it here
    const cloudFrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  },
};
