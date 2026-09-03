import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

// Load .env.local manually if not in environment
function loadEnv() {
    if (process.env.MONGODB_URI) return;
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx !== -1) {
                const key = trimmed.substring(0, eqIdx).trim();
                let val = trimmed.substring(eqIdx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                process.env[key] = val;
            }
        }
    }
}

loadEnv();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ Error: MONGODB_URI not found in .env.local");
    process.exit(1);
}

const emailToPromote = process.argv[2];

if (!emailToPromote) {
    console.log("--------------------------------------------------");
    console.log("Usage:   npx tsx scripts/make-admin.ts <email> [demote]");
    console.log("Promote: npx tsx scripts/make-admin.ts user@example.com");
    console.log("Demote:  npx tsx scripts/make-admin.ts user@example.com demote");
    console.log("--------------------------------------------------");
    process.exit(1);
}

const normalizedEmail = emailToPromote.trim().toLowerCase();
const isDemote = process.argv[3] === "demote";
const targetRole = isDemote ? "user" : "admin";

async function main() {
    const client = new MongoClient(uri!);
    try {
        await client.connect();
        const db = client.db("myfirstapp");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email: normalizedEmail });

        if (!user) {
            console.error(`❌ No user found with email: "${normalizedEmail}"`);
            console.log("💡 Tip: The user must register an account first before you can promote them.");
            process.exit(1);
        }

        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { role: targetRole, updatedAt: new Date() } }
        );

        console.log(`✅ Success! User "${user.name}" (${normalizedEmail}) is now an ${targetRole.toUpperCase()}.`);
    } catch (err) {
        console.error("❌ Database operation failed:", err);
    } finally {
        await client.close();
    }
}

main();
