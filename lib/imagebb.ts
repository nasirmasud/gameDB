export async function uploadToImageBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;

  if (!apiKey || apiKey === "your_imgbb_api_key_here") {
    throw new Error("ImageBB API key not configured.");
  }

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", file);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Image upload failed.");
  }

  const data = await res.json();
  return data.data.url;
}
