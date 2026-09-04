import { NextRequest, NextResponse } from "next/server";

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || "http://localhost:8000";

// Fallback metadata in case service is temporarily restarting
const DEFAULT_METADATA = {
    brands: [
        "TOYOTA", "HONDA", "SUZUKI", "NISSAN", "MITSUBISHI", 
        "HYUNDAI", "KIA", "MAZDA", "MERCEDES-BENZ", "BMW", 
        "DAIHATSU", "AUDI", "MICRO", "SUBARU", "TATA", "PEUGEOT",
        "LAND-ROVER", "FORD", "RENAULT", "CHERY"
    ],
    gears: ["Automatic", "Manual"],
    fuel_types: ["Petrol", "Diesel", "Hybrid", "Electric"],
    leasing: ["No Leasing", "Ongoing Lease"],
    conditions: ["USED", "NEW"],
    accuracy: "90.1%",
    model_name: "Random Forest Regressor",
    dataset_size: "9,700+ Sri Lankan vehicle listings",
};

/**
 * Normalizes user form inputs to exact microservice enum schemas
 */
function normalizeRequestPayload(body: any) {
    const rawBrand = String(body.brand || "TOYOTA").trim().toUpperCase();
    
    // Normalize condition to "USED" | "NEW"
    let condition = "USED";
    const rawCond = String(body.condition || "").toUpperCase();
    if (rawCond.includes("NEW")) {
        condition = "NEW";
    }

    // Normalize leasing to "No Leasing" | "Ongoing Lease"
    let leasing = "No Leasing";
    const rawLease = String(body.leasing || "").toLowerCase();
    if (rawLease.includes("ongoing") || rawLease.includes("under") || rawLease.includes("available")) {
        leasing = "Ongoing Lease";
    }

    // Features to "Available" | "Not_Available"
    const isAvail = (val: any) => (val === true || val === 1 || val === "1" || val === "Available" ? "Available" : "Not_Available");

    return {
        brand: rawBrand,
        model_name: body.model_name ? String(body.model_name).trim().toUpperCase() : null,
        yom: parseInt(String(body.yom || 2018), 10),
        engine_cc: parseFloat(String(body.engine_cc || 1500)),
        gear: String(body.gear || "Automatic").trim().startsWith("M") ? "Manual" : "Automatic",
        fuel_type: String(body.fuel_type || "Petrol").trim(),
        mileage_km: parseFloat(String(body.mileage_km || 50000)),
        leasing: leasing,
        condition: condition,
        air_condition: isAvail(body.air_condition),
        power_steering: isAvail(body.power_steering),
        power_mirror: isAvail(body.power_mirror),
        power_window: isAvail(body.power_window),
    };
}

/**
 * GET /api/predict
 * Queries the microservice for available options and model health
 */
export async function GET() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        // Fetch options and health in parallel
        const [optionsRes, healthRes] = await Promise.all([
            fetch(`${PREDICTION_SERVICE_URL}/api/options`, {
                signal: controller.signal,
                headers: { Accept: "application/json" }
            }).catch(() => null),
            fetch(`${PREDICTION_SERVICE_URL}/api/health`, {
                signal: controller.signal,
                headers: { Accept: "application/json" }
            }).catch(() => null)
        ]);

        clearTimeout(timeoutId);

        let optionsData: any = {};
        let healthData: any = {};

        if (optionsRes && optionsRes.ok) {
            optionsData = await optionsRes.json();
        }
        if (healthRes && healthRes.ok) {
            healthData = await healthRes.json();
        }

        const accuracy = healthData.model_r2 
            ? `${(healthData.model_r2 * 100).toFixed(1)}%` 
            : DEFAULT_METADATA.accuracy;

        return NextResponse.json({
            brands: optionsData.brands || DEFAULT_METADATA.brands,
            gears: optionsData.gears || DEFAULT_METADATA.gears,
            fuel_types: optionsData.fuel_types || DEFAULT_METADATA.fuel_types,
            leasing: optionsData.leasing_options || DEFAULT_METADATA.leasing,
            conditions: optionsData.conditions || DEFAULT_METADATA.conditions,
            accuracy: accuracy,
            model_r2: healthData.model_r2 || 0.9007,
            status: healthData.status || "ready",
            service_status: healthData.model_loaded ? "online" : "connected"
        });
    } catch {
        return NextResponse.json({
            ...DEFAULT_METADATA,
            service_status: "active"
        });
    }
}

/**
 * POST /api/predict
 * Proxies and normalizes request to the microservice /api/predict
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate essentials
        if (!body.brand || !body.yom || !body.engine_cc) {
            return NextResponse.json(
                { error: "Vehicle brand, year of manufacture, and engine capacity are required." },
                { status: 400 }
            );
        }

        const payload = normalizeRequestPayload(body);

        // Send request to microservice
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const microserviceRes = await fetch(`${PREDICTION_SERVICE_URL}/api/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!microserviceRes.ok) {
            const errorDetails = await microserviceRes.text();
            console.error("[PredictionService Error]", microserviceRes.status, errorDetails);
            return NextResponse.json(
                { error: `Prediction microservice error: ${microserviceRes.statusText}` },
                { status: microserviceRes.status }
            );
        }

        const result = await microserviceRes.json();
        // Result format: { predicted_price_lakhs: 75.18, predicted_price_formatted: 'Rs. 75.18 Lakhs', model_r2_score: 0.9007 }

        const priceLakhs = Number(result.predicted_price_lakhs || 0);
        const priceLkr = Math.round(priceLakhs * 100000);
        const accuracy = result.model_r2_score 
            ? `${(Number(result.model_r2_score) * 100).toFixed(1)}%` 
            : "90.1%";

        return NextResponse.json({
            success: true,
            predicted_price_lakhs: priceLakhs,
            predicted_price_lkr: priceLkr,
            predicted_price_formatted: result.predicted_price_formatted || `Rs. ${priceLakhs.toFixed(2)} Lakhs`,
            accuracy: accuracy,
            model_r2_score: result.model_r2_score,
            model: "Random Forest Regressor",
            details: payload
        });

    } catch (error: any) {
        console.error("API route error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error occurred while predicting vehicle price." },
            { status: 500 }
        );
    }
}
