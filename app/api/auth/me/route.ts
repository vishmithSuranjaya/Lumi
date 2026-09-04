import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        // Fetch fresh user data from DB to ensure role/status changes are immediate
        const client = await clientPromise;
        const db = client.db("myfirstapp");

        let dbUser = null;
        if (session.id && ObjectId.isValid(session.id)) {
            dbUser = await db.collection("users").findOne({ _id: new ObjectId(session.id) });
        } else if (session.email) {
            dbUser = await db.collection("users").findOne({ email: session.email.toLowerCase() });
        }

        if (!dbUser) {
            return NextResponse.json({ user: session }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                id: dbUser._id.toString(),
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role || "user",
                avatar: dbUser.avatar,
                phone: dbUser.phone,
            },
        });
    } catch (error) {
        console.error("Fetch me session error:", error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
