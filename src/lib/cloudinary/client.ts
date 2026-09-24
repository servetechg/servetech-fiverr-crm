import { v2 as cloudinary } from "cloudinary";

const DEFAULT_CLOUDINARY_FOLDER = "serveTechCRM/documents";

export function getCloudinaryFolder(): string {
  const folder = process.env.CLOUDINARY_FOLDER?.trim();
  return folder && folder.length > 0 ? folder : DEFAULT_CLOUDINARY_FOLDER;
}

export function getCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* environment variables.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryClient(): typeof cloudinary {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return cloudinary;
}
