import path from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

function getStorageConfig() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'media';

  if (!projectUrl || !anonKey) {
    throw new Error('Missing Supabase configuration');
  }

  return {
    projectUrl,
    anonKey,
    serviceRoleKey,
    bucket,
  };
}

function createStorageClient(accessToken?: string | null) {
  const config = getStorageConfig();
  const apiKey = config.serviceRoleKey ?? config.anonKey;

  return createClient(config.projectUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

export async function saveUploadedImage(
  file: File,
  folder = 'products',
  accessToken?: string | null
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const { bucket } = getStorageConfig();
  const client = createStorageClient(accessToken);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = path.extname(file.name) || '.jpg';
  const fileName = `${Date.now()}-${randomUUID()}-${sanitizeFilename(path.basename(file.name, extension))}${extension}`;
  const objectPath = `${folder}/${fileName}`;

  const uploadResult = await client.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  const publicUrlResult = client.storage.from(bucket).getPublicUrl(objectPath);

  if (!publicUrlResult.data.publicUrl) {
    throw new Error('Failed to resolve uploaded image URL');
  }

  return publicUrlResult.data.publicUrl;
}

export async function saveUploadedImages(
  files: File[],
  folder = 'products',
  accessToken?: string | null
) {
  const paths: string[] = [];

  for (const file of files) {
    if (file.size <= 0) {
      continue;
    }

    paths.push(await saveUploadedImage(file, folder, accessToken));
  }

  return paths;
}
