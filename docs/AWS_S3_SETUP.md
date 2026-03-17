# AWS S3 Receipt Upload Setup Guide

## Prerequisites

- AWS Account with S3 access
- IAM user with S3 permissions

## Step 1: Install AWS SDK

```bash
npm install @aws-sdk/client-s3
```

## Step 2: Create S3 Bucket for Receipts

1. **Go to AWS S3 Console**: https://console.aws.amazon.com/s3/

2. **Create a new bucket**:
   - Bucket name: `aws-expense-tracker-receipts` (or your preferred name)
   - Region: `us-east-1` (or your preferred region)
   - Keep other settings as default

3. **Configure Bucket Permissions**:

   **Option A: Public Access (Simple but less secure)**
   - Unblock all public access
   - Add bucket policy for public read access:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::aws-expense-tracker-receipts/*"
       }
     ]
   }
   ```

   **Option B: Private with CORS (Recommended)**
   - Keep public access blocked
   - Configure CORS:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

## Step 3: Create IAM User with S3 Access

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/

2. **Create User**:
   - User name: `expense-tracker-s3-uploader`
   - Access type: Programmatic access

3. **Attach Policy**:
   - Create inline policy with these permissions:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::aws-expense-tracker-receipts/*"
       }
     ]
   }
   ```

4. **Save Credentials**:
   - Access Key ID
   - Secret Access Key

## Step 4: Configure Environment Variables

Update your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5038
VITE_REDIRECT_URI=http://localhost:5173/login

# AWS S3 Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIA...your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key
VITE_S3_RECEIPT_BUCKET=aws-expense-tracker-receipts

# Optional: CloudFront (if using CDN)
# VITE_CLOUDFRONT_DOMAIN=d123456789.cloudfront.net
```

**⚠️ IMPORTANT**:

- Never commit the `.env` file to Git
- Add `.env` to your `.gitignore`
- For production, use environment variables in your hosting platform

## Step 5: Restart Dev Server

```bash
npm run dev
```

## Optional: Setup CloudFront CDN

For better performance and security:

1. Create CloudFront distribution
2. Origin: Your S3 bucket
3. Update `.env` with CloudFront domain
4. Update `s3Service.ts` to use CloudFront URLs

## File Structure

```
src/
├── services/
│   └── s3Service.ts          # S3 upload logic
├── components/
│   └── tranactions/
│       └── add-transaction-dialog.tsx  # File upload UI
```

## Features

✅ File upload with preview
✅ Image and PDF support
✅ File size validation (5MB limit)
✅ File type validation
✅ S3 direct upload
✅ URL stored in database
✅ Remove/replace file option

## Security Notes

1. **For Production**:
   - Use AWS Cognito or backend proxy for S3 uploads
   - Don't expose AWS credentials in frontend
   - Implement pre-signed URLs from backend
   - Add rate limiting

2. **Current Setup** (Development):
   - Frontend direct upload (simple but less secure)
   - Use IAM user with minimal permissions
   - Consider IP whitelisting in IAM policy

## Troubleshooting

**CORS Errors**:

- Check CORS configuration in S3 bucket
- Ensure your domain is in AllowedOrigins

**403 Forbidden**:

- Verify IAM user has correct permissions
- Check bucket policy
- Ensure credentials are correct in `.env`

**Upload Failed**:

- Check file size (< 5MB)
- Verify file type is allowed
- Check browser console for errors
