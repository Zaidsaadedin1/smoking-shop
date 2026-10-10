import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourceDirectory =
  process.argv[2] ?? "/Users/zaid/Desktop/products";
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

if (!projectUrl || !serviceRoleKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before uploading.",
  );
}

const files = fs
  .readdirSync(sourceDirectory)
  .filter((name) => /^WhatsApp Image 2026-10-06 at .*\.jpeg$/i.test(name))
  .sort();

if (files.length !== 25) {
  throw new Error(`Expected 25 JPEGs, found ${files.length}.`);
}

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const uploaded = [];
for (const name of files) {
  const storagePath = `vape-catalog/2026-10-06/${name.replaceAll(" ", "-")}`;
  const bytes = fs.readFileSync(path.join(sourceDirectory, name));
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for ${name}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  uploaded.push({ source: name, storage_path: storagePath, url: data.publicUrl });
}

console.log(JSON.stringify(uploaded, null, 2));
