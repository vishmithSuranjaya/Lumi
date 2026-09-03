export const VEHICLE_CATEGORIES = [
    "Cars & Sedans",
    "SUVs & 4x4",
    "Sports & Luxury Coupes",
    "Motorcycles & Scooters",
    "Three-Wheelers (Tuk-Tuk)",
    "Lorries & Commercial Trucks",
    "Buses & Vans",
    "Tractors & Heavy Machinery",
] as const;

export const SRI_LANKA_DISTRICTS = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
] as const;

export const VEHICLE_CONDITIONS = [
    "Brand New (Unregistered)",
    "Reconditioned (Unregistered)",
    "Registered (Used)",
] as const;

export const FUEL_TYPES = [
    "Petrol",
    "Diesel",
    "Hybrid (Petrol/Electric)",
    "Plug-in Hybrid (PHEV)",
    "100% Electric (EV)",
] as const;

export const TRANSMISSIONS = [
    "Automatic",
    "Manual",
    "Tiptronic / Dual-Clutch",
    "CVT",
] as const;

export interface RawAdvertisementInput {
    category?: string;
    brand?: string;
    model?: string;
    year?: string | number;
    condition?: string;
    mileage?: string | number;
    fuelType?: string;
    transmission?: string;
    engineCapacity?: string;
    priceLKR?: string | number;
    isNegotiable?: boolean;
    district?: string;
    city?: string;
    description?: string;
    sellerName?: string;
    sellerPhone?: string;
    sellerEmail?: string;
    hasWhatsApp?: boolean;
    images?: string[];
}

export interface SanitizedAdvertisement {
    category: string;
    brand: string;
    model: string;
    year: number;
    condition: string;
    mileage: string;
    fuelType: string;
    transmission: string;
    engineCapacity: string;
    priceLKR: number;
    isNegotiable: boolean;
    district: string;
    city: string;
    description: string;
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
    hasWhatsApp: boolean;
    images: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    sanitized?: SanitizedAdvertisement;
}

// Helper to parse price string or number (e.g. "18,500,000" or "LKR 18500000" -> 18500000)
export function parsePrice(input: string | number | undefined): number | null {
    if (typeof input === "number") {
        return isNaN(input) || input <= 0 ? null : input;
    }
    if (!input || typeof input !== "string") return null;

    // Remove commas, currency symbols, and extra spaces
    const cleaned = input.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

// Helper to validate phone number (supports Sri Lankan numbers like 0771234567, +9477..., 011... and standard international 9-15 digits)
export function isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    // Standard phone: optional leading +, followed by 9 to 15 digits
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(cleanPhone);
}

// Helper to validate email format
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Shared validator for advertisement form submissions.
 * Used on both client-side (for instant UI feedback) and server-side (for data integrity).
 */
export function validateAdvertisement(data: RawAdvertisementInput): ValidationResult {
    const errors: Record<string, string> = {};

    // 1. Category
    const category = (data.category || "").trim();
    if (!category) {
        errors.category = "Please select a vehicle category";
    } else if (!VEHICLE_CATEGORIES.includes(category as any)) {
        errors.category = "Invalid category selected";
    }

    // 2. Brand
    const brand = (data.brand || "").trim();
    if (!brand) {
        errors.brand = "Brand/Make is required";
    } else if (brand.length < 2) {
        errors.brand = "Brand must be at least 2 characters";
    } else if (brand.length > 50) {
        errors.brand = "Brand cannot exceed 50 characters";
    }

    // 3. Model
    const model = (data.model || "").trim();
    if (!model) {
        errors.model = "Model is required";
    } else if (model.length < 1) {
        errors.model = "Model is required";
    } else if (model.length > 50) {
        errors.model = "Model cannot exceed 50 characters";
    }

    // 4. Year
    const currentYear = new Date().getFullYear();
    const year = typeof data.year === "string" ? parseInt(data.year, 10) : data.year;
    if (!year || isNaN(year)) {
        errors.year = "Manufactured year is required";
    } else if (year < 1950 || year > currentYear + 1) {
        errors.year = `Year must be between 1950 and ${currentYear + 1}`;
    }

    // 5. Condition
    const condition = (data.condition || "").trim();
    if (!condition) {
        errors.condition = "Please select condition";
    } else if (!VEHICLE_CONDITIONS.includes(condition as any)) {
        errors.condition = "Invalid condition selected";
    }

    // 6. Mileage
    const mileageStr = String(data.mileage ?? "").trim();
    if (!mileageStr) {
        errors.mileage = "Mileage is required (enter 0 for brand new)";
    }

    // 7. Fuel Type
    const fuelType = (data.fuelType || "").trim();
    if (fuelType && !FUEL_TYPES.includes(fuelType as any)) {
        errors.fuelType = "Invalid fuel type selected";
    }

    // 8. Transmission
    const transmission = (data.transmission || "").trim();
    if (transmission && !TRANSMISSIONS.includes(transmission as any)) {
        errors.transmission = "Invalid transmission selected";
    }

    // 9. Price
    const parsedPrice = parsePrice(data.priceLKR);
    if (!parsedPrice) {
        errors.priceLKR = "Please enter a valid price greater than 0";
    }

    // 10. District
    const district = (data.district || "").trim();
    if (!district) {
        errors.district = "Please select a district in Sri Lanka";
    } else if (!SRI_LANKA_DISTRICTS.includes(district as any)) {
        errors.district = "Invalid district selected";
    }

    // 11. City
    const city = (data.city || "").trim();
    if (!city) {
        errors.city = "City/Town is required";
    } else if (city.length < 2) {
        errors.city = "City must be at least 2 characters";
    } else if (city.length > 60) {
        errors.city = "City cannot exceed 60 characters";
    }

    // 12. Seller Name
    const sellerName = (data.sellerName || "").trim();
    if (!sellerName) {
        errors.sellerName = "Seller name is required";
    } else if (sellerName.length < 2) {
        errors.sellerName = "Seller name must be at least 2 characters";
    } else if (sellerName.length > 60) {
        errors.sellerName = "Seller name cannot exceed 60 characters";
    }

    // 13. Seller Phone
    const sellerPhone = (data.sellerPhone || "").trim();
    if (!sellerPhone) {
        errors.sellerPhone = "Primary phone number is required";
    } else if (!isValidPhoneNumber(sellerPhone)) {
        errors.sellerPhone = "Please enter a valid phone number (e.g. 077 123 4567 or +94 77 123 4567)";
    }

    // 14. Seller Email
    const sellerEmail = (data.sellerEmail || "").trim();
    if (!sellerEmail) {
        errors.sellerEmail = "Email address is required";
    } else if (!isValidEmail(sellerEmail)) {
        errors.sellerEmail = "Please enter a valid email address (e.g. name@example.com)";
    }

    // 15. Images
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    if (images.length === 0) {
        errors.images = "At least one vehicle photo is required";
    } else if (images.length > 5) {
        errors.images = "A maximum of 5 photos are allowed";
    } else {
        const hasInvalidFormat = images.some(
            (img) =>
                typeof img !== "string" ||
                (!img.startsWith("http://") &&
                    !img.startsWith("https://") &&
                    !img.startsWith("data:image/") &&
                    !img.startsWith("blob:"))
        );
        if (hasInvalidFormat) {
            errors.images = "One or more photos have an invalid format";
        }
    }

    // 16. Description (optional)
    const description = (data.description || "").trim();
    if (description.length > 2000) {
        errors.description = "Description cannot exceed 2000 characters";
    }

    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors,
        sanitized: isValid
            ? {
                  category,
                  brand,
                  model,
                  year: year!,
                  condition,
                  mileage: mileageStr,
                  fuelType: fuelType || "Petrol",
                  transmission: transmission || "Automatic",
                  engineCapacity: (data.engineCapacity || "").trim(),
                  priceLKR: parsedPrice!,
                  isNegotiable: Boolean(data.isNegotiable),
                  district,
                  city,
                  description,
                  sellerName,
                  sellerPhone,
                  sellerEmail: sellerEmail.toLowerCase(),
                  hasWhatsApp: Boolean(data.hasWhatsApp),
                  images,
              }
            : undefined,
    };
}
