import { NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";

// Allowed MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 5;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("images") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, message: "No image files provided." },
                { status: 400 }
            );
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { success: false, message: `Maximum ${MAX_FILES} images allowed per upload.` },
                { status: 400 }
            );
        }

        // Validate each file
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid file format for "${file.name}". Only JPG, PNG, and WebP are allowed.`,
                    },
                    { status: 400 }
                );
            }

            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `File "${file.name}" exceeds the 5MB size limit.`,
                    },
                    { status: 400 }
                );
            }
        }

        // Upload files to ImageKit in parallel
        const uploadPromises = files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

            const uploadResult = await imagekit.upload({
                file: buffer,
                fileName: `${Date.now()}_${safeName}`,
                folder: "/vehicles",
                useUniqueFileName: true,
            });

            return uploadResult.url;
        });

        const urls = await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            message: "Images uploaded successfully to ImageKit.",
            urls,
        });
    } catch (error: any) {
        console.error("ImageKit upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to upload images to ImageKit.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
