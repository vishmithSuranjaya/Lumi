import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { validateAdvertisement } from "@/lib/validations/advertisement";

export async function POST(request: Request) {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON in request body",
                },
                { status: 400 }
            );
        }

        // 1. Backend Data Validation
        const validation = validateAdvertisement(body);
        if (!validation.isValid || !validation.sanitized) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed. Please check the provided information.",
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        // 2. Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        // 3. Generate unique reference ID
        const refId = `LUMI-${Math.floor(100000 + Math.random() * 900000)}`;

        const documentToInsert = {
            ...validation.sanitized,
            refId,
            status: "active",
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // 4. Save to MongoDB
        const insertResult = await collection.insertOne(documentToInsert);

        return NextResponse.json(
            {
                success: true,
                message: "Advertisement published successfully!",
                refId,
                insertedId: insertResult.insertedId.toString(),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating advertisement:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error occurred while saving advertisement.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const district = searchParams.get("district");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

        const filter: Record<string, any> = { status: "active" };
        if (category) filter.category = category;
        if (district) filter.district = district;

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const ads = await db
            .collection("advertisements")
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return NextResponse.json({
            success: true,
            count: ads.length,
            data: ads,
        });
    } catch (error: any) {
        console.error("Error fetching advertisements:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch advertisements",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
