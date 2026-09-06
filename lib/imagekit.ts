import ImageKit from "imagekit";

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.warn("⚠️ ImageKit environment variables are missing in .env.local");
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * Deletes an image from ImageKit by matching its URL or filename
 */
export async function deleteImageByUrl(url?: string | null): Promise<boolean> {
    if (!url || typeof url !== "string") return false;
    if (!url.includes("imagekit.io")) return false;

    try {
        const urlObj = new URL(url);
        const pathname = decodeURIComponent(urlObj.pathname);
        const parts = pathname.split("/").filter(Boolean);
        const fileName = parts[parts.length - 1];

        if (!fileName) return false;

        const files = await imagekit.listFiles({
            name: fileName,
            limit: 5,
        });

        if (Array.isArray(files)) {
            for (const item of files) {
                if ("fileId" in item && (item.name === fileName || item.filePath?.endsWith(fileName))) {
                    await imagekit.deleteFile(item.fileId);
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error("Error deleting image from ImageKit:", error);
        return false;
    }
}

export default imagekit;
