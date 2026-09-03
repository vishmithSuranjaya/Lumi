import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("myfirstapp");

        // Ping database to confirm connection
        await db.command({ ping: 1 });

        return NextResponse.json({
            success: true,
            message: "MongoDB connected successfully!",
            database: db.databaseName,
        });
    } catch (error: any) {
        console.error("MongoDB Connection Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "MongoDB connection failed",
                error: error?.message || "Unknown connection error",
            },
            { status: 500 }
        );
    }
}
