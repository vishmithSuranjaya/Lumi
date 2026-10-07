import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "all";

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const adsCollection = db.collection("advertisements");
        const usersCollection = db.collection("users");

        // Optional date filter
        let dateFilter: Record<string, any> = {};
        const now = new Date();
        if (range === "7d") {
            const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: past7 } };
        } else if (range === "30d") {
            const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: past30 } };
        } else if (range === "90d") {
            const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: past90 } };
        }

        // 1. Fetch filtered and all-time ads
        const filteredAds = await adsCollection.find(dateFilter).toArray();
        const allAds = await adsCollection.find({}).toArray();
        const allUsers = await usersCollection.find({}, { projection: { passwordHash: 0 } }).toArray();

        // 2. High-level Inventory Counts
        const totalAdsCount = filteredAds.length;
        const liveAds = filteredAds.filter((a) => a.status === "approved" || a.status === "active");
        const pendingAds = filteredAds.filter((a) => a.status === "pending");
        const rejectedAds = filteredAds.filter((a) => a.status === "rejected");
        const soldAds = filteredAds.filter((a) => a.status === "sold");
        const archivedAds = filteredAds.filter((a) => a.status === "archived");

        // 3. Financial Valuations
        const liveValuationLKR = liveAds.reduce((acc, a) => acc + (Number(a.priceLKR) || 0), 0);
        const totalValuationLKR = filteredAds.reduce((acc, a) => acc + (Number(a.priceLKR) || 0), 0);
        const averagePriceLKR = liveAds.length > 0 ? Math.round(liveValuationLKR / liveAds.length) : 0;
        
        // Negotiable vs Fixed
        const negotiableCount = filteredAds.filter((a) => a.isNegotiable).length;
        const negotiablePercent = totalAdsCount > 0 ? Math.round((negotiableCount / totalAdsCount) * 100) : 0;

        // 4. Category Distribution
        const categoryMap: Record<string, { count: number; valuation: number }> = {};
        for (const ad of filteredAds) {
            const cat = ad.category || "Other";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { count: 0, valuation: 0 };
            }
            categoryMap[cat].count += 1;
            categoryMap[cat].valuation += Number(ad.priceLKR) || 0;
        }
        const categories = Object.entries(categoryMap)
            .map(([name, data]) => ({
                name,
                count: data.count,
                valuation: data.valuation,
                percentage: totalAdsCount > 0 ? Math.round((data.count / totalAdsCount) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 5. Top Brands / Makes
        const brandMap: Record<string, number> = {};
        for (const ad of filteredAds) {
            const brand = (ad.brand || "Unspecified").trim();
            brandMap[brand] = (brandMap[brand] || 0) + 1;
        }
        const topBrands = Object.entries(brandMap)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalAdsCount > 0 ? Math.round((count / totalAdsCount) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // 6. Fuel Type Breakdown
        const fuelMap: Record<string, number> = {};
        for (const ad of filteredAds) {
            const fuel = (ad.fuelType || "Petrol").trim();
            fuelMap[fuel] = (fuelMap[fuel] || 0) + 1;
        }
        const fuelBreakdown = Object.entries(fuelMap)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalAdsCount > 0 ? Math.round((count / totalAdsCount) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 7. Transmission Breakdown
        const transMap: Record<string, number> = {};
        for (const ad of filteredAds) {
            const trans = (ad.transmission || "Automatic").trim();
            transMap[trans] = (transMap[trans] || 0) + 1;
        }
        const transmissionBreakdown = Object.entries(transMap)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalAdsCount > 0 ? Math.round((count / totalAdsCount) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 8. Territory / District Hotspots
        const districtMap: Record<string, { count: number; valuation: number }> = {};
        for (const ad of filteredAds) {
            const dist = (ad.district || "Colombo").trim();
            if (!districtMap[dist]) {
                districtMap[dist] = { count: 0, valuation: 0 };
            }
            districtMap[dist].count += 1;
            districtMap[dist].valuation += Number(ad.priceLKR) || 0;
        }
        const districtHotspots = Object.entries(districtMap)
            .map(([name, data]) => ({
                name,
                count: data.count,
                valuation: data.valuation,
                percentage: totalAdsCount > 0 ? Math.round((data.count / totalAdsCount) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // 9. Price Bracket Tiers
        let tierUnder5M = 0;
        let tier5To10M = 0;
        let tier10To20M = 0;
        let tierOver20M = 0;

        for (const ad of filteredAds) {
            const p = Number(ad.priceLKR) || 0;
            if (p < 5000000) tierUnder5M += 1;
            else if (p < 10000000) tier5To10M += 1;
            else if (p < 20000000) tier10To20M += 1;
            else tierOver20M += 1;
        }

        const priceTiers = [
            { label: "Budget (Under 5M)", count: tierUnder5M, percentage: totalAdsCount > 0 ? Math.round((tierUnder5M / totalAdsCount) * 100) : 0 },
            { label: "Mid-Range (5M - 10M)", count: tier5To10M, percentage: totalAdsCount > 0 ? Math.round((tier5To10M / totalAdsCount) * 100) : 0 },
            { label: "Premium (10M - 20M)", count: tier10To20M, percentage: totalAdsCount > 0 ? Math.round((tier10To20M / totalAdsCount) * 100) : 0 },
            { label: "Luxury / Exotic (20M+)", count: tierOver20M, percentage: totalAdsCount > 0 ? Math.round((tierOver20M / totalAdsCount) * 100) : 0 },
        ];

        // 10. Moderation & Quality Metrics
        const reviewedAds = filteredAds.filter((a) => a.status === "approved" || a.status === "active" || a.status === "rejected");
        const approvalRate = reviewedAds.length > 0 ? Math.round((liveAds.length / reviewedAds.length) * 100) : 100;

        const rejectionReasonMap: Record<string, number> = {};
        for (const ad of rejectedAds) {
            const reason = (ad.rejectionReason || "Incomplete or inaccurate specifications").trim();
            rejectionReasonMap[reason] = (rejectionReasonMap[reason] || 0) + 1;
        }
        const topRejectionReasons = Object.entries(rejectionReasonMap)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 11. Most Viewed Listings
        const mostViewedAds = [...filteredAds]
            .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
            .slice(0, 5)
            .map((a: any) => ({
                _id: a._id.toString(),
                refId: a.refId || `LUMI-${a._id.toString().substring(0, 6)}`,
                title: `${a.brand || ""} ${a.model || ""} (${a.year || ""})`.trim(),
                priceLKR: Number(a.priceLKR) || 0,
                views: Number(a.views) || 0,
                category: a.category || "Vehicle",
                status: a.status || "active",
                images: Array.isArray(a.images) ? a.images.slice(0, 1) : [],
            }));

        // 12. User & Seller Dynamics
        const totalUsers = allUsers.length;
        const googleUsers = allUsers.filter((u) => u.authProvider === "google").length;
        
        // Find distinct sellers in advertisements
        const sellerEmails = new Set(allAds.map((a) => (a.sellerEmail || "").toLowerCase().trim()).filter(Boolean));
        const sellerCount = sellerEmails.size;
        const sellerConversionRate = totalUsers > 0 ? Math.round((sellerCount / totalUsers) * 100) : 0;

        // Top Sellers
        const sellerListingMap: Record<string, { name: string; email: string; phone: string; count: number; totalValue: number }> = {};
        for (const ad of allAds) {
            const email = (ad.sellerEmail || "").toLowerCase().trim();
            if (!email) continue;
            if (!sellerListingMap[email]) {
                sellerListingMap[email] = {
                    name: ad.sellerName || "Verified Seller",
                    email,
                    phone: ad.sellerPhone || "",
                    count: 0,
                    totalValue: 0,
                };
            }
            sellerListingMap[email].count += 1;
            sellerListingMap[email].totalValue += Number(ad.priceLKR) || 0;
        }

        const topSellers = Object.values(sellerListingMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 13. Submission Trend by Month (Last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap: Record<string, { month: string; submissions: number; approved: number }> = {};
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyMap[key] = {
                month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                submissions: 0,
                approved: 0,
            };
        }

        for (const ad of allAds) {
            if (!ad.createdAt) continue;
            const adDate = new Date(ad.createdAt);
            const key = `${adDate.getFullYear()}-${adDate.getMonth()}`;
            if (monthlyMap[key]) {
                monthlyMap[key].submissions += 1;
                if (ad.status === "approved" || ad.status === "active") {
                    monthlyMap[key].approved += 1;
                }
            }
        }

        const monthlyTrend = Object.values(monthlyMap);

        return NextResponse.json({
            success: true,
            range,
            kpis: {
                liveValuationLKR,
                totalValuationLKR,
                averagePriceLKR,
                totalAdsCount,
                liveAdsCount: liveAds.length,
                pendingAdsCount: pendingAds.length,
                rejectedAdsCount: rejectedAds.length,
                soldAdsCount: soldAds.length,
                archivedAdsCount: archivedAds.length,
                negotiablePercent,
                approvalRate,
                totalUsers,
                sellerCount,
                sellerConversionRate,
                googleUsers,
            },
            categories,
            topBrands,
            fuelBreakdown,
            transmissionBreakdown,
            districtHotspots,
            priceTiers,
            topRejectionReasons,
            mostViewedAds,
            topSellers,
            monthlyTrend,
        });
    } catch (error: any) {
        console.error("Error generating admin analytics:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate analytics.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
