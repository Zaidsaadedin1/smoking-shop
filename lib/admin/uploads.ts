import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

export async function saveUploadedImage(file: File, folder = 'products') {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = path.extname(file.name) || '.jpg';
  const fileName = `${Date.now()}-${randomUUID()}-${sanitizeFilename(path.basename(file.name, extension))}${extension}`;
  const relativeDir = path.join('uploads', folder);
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, buffer);

  return `/${relativeDir}/${fileName}`;
}

export async function saveUploadedImages(files: File[], folder = 'products') {
  const paths: string[] = [];

  for (const file of files) {
    if (file.size <= 0) {
      continue;
    }

    paths.push(await saveUploadedImage(file, folder));
  }

  return paths;
}
