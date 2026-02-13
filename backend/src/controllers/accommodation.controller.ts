import { Request, Response } from "express";
import { AccommodationService } from "../services/accommodation.service";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../dtos/accommodation.dto";
import z from "zod";

const accommodationService = new AccommodationService();

export class AccommodationController {
    private parseFormData = (body: any) => {
        const parsed: any = { ...body };
        
        // Parse JSON string fields from FormData
        if (parsed.location && typeof parsed.location === 'string') {
            parsed.location = JSON.parse(parsed.location);
        }
        if (parsed.amenities && typeof parsed.amenities === 'string') {
            try {
                parsed.amenities = JSON.parse(parsed.amenities);
            } catch (e) {
                parsed.amenities = [];
            }
        }
        if (parsed.ecoFriendlyHighlights && typeof parsed.ecoFriendlyHighlights === 'string') {
            try {
                parsed.ecoFriendlyHighlights = JSON.parse(parsed.ecoFriendlyHighlights);
            } catch (e) {
                parsed.ecoFriendlyHighlights = [];
            }
        }
        
        // Handle images - can be string, array of strings, or array with JSON at end
        if (parsed.images) {
            if (typeof parsed.images === 'string') {
                try {
                    const parsedImages = JSON.parse(parsed.images);
                    // Ensure it's always an array of strings
                    if (Array.isArray(parsedImages)) {
                        parsed.images = parsedImages.filter((img: any) => typeof img === 'string' && img.trim() !== '');
                    } else {
                        // If parsed to non-array, set to empty array
                        parsed.images = [];
                    }
                } catch (e) {
                    // If parsing fails, treat as a single URL string
                    parsed.images = parsed.images.trim() ? [parsed.images] : [];
                }
            } else if (Array.isArray(parsed.images)) {
                parsed.images = parsed.images.flatMap((img: any) => {
                    if (typeof img === 'string') {
                        try {
                            // Try to parse as JSON first (array of URLs)
                            const parsed_img = JSON.parse(img);
                            if (Array.isArray(parsed_img)) {
                                return parsed_img.filter((i: any) => typeof i === 'string' && i.trim() !== '');
                            }
                            return [];
                        } catch (e) {
                            // If not JSON, treat as URL string
                            return img.trim() ? [img] : [];
                        }
                    }
                    return [];
                }).filter((img: any) => typeof img === 'string' && img.trim() !== '');
            } else {
                // If images is neither string nor array, set to empty array
                parsed.images = [];
            }
        } else {
            // If images field doesn't exist, set to empty array
            parsed.images = [];
        }
        
        // Convert price to number
        if (parsed.pricePerNight && typeof parsed.pricePerNight === 'string') {
            parsed.pricePerNight = Number(parsed.pricePerNight);
        }
        
        // Convert boolean fields
        if (typeof parsed.isActive === 'string') {
            parsed.isActive = parsed.isActive === 'true';
        }
        
        // Final safety check: ensure images is always an array of strings
        if (!Array.isArray(parsed.images)) {
            parsed.images = [];
        }
        parsed.images = parsed.images.filter((img: any) => 
            typeof img === 'string' && img.trim() !== ''
        );
        
        // Final safety check: ensure amenities is always an array of strings
        if (!Array.isArray(parsed.amenities)) {
            parsed.amenities = [];
        }
        parsed.amenities = parsed.amenities.filter((item: any) => 
            typeof item === 'string' && item.trim() !== ''
        );
        
        // Final safety check: ensure ecoFriendlyHighlights is always an array of strings
        if (!Array.isArray(parsed.ecoFriendlyHighlights)) {
            parsed.ecoFriendlyHighlights = [];
        }
        parsed.ecoFriendlyHighlights = parsed.ecoFriendlyHighlights.filter((item: any) => 
            typeof item === 'string' && item.trim() !== ''
        );
        
        return parsed;
    };

    createAccommodation = async (req: Request, res: Response) => {
        try {
            console.log('=== CREATE ACCOMMODATION ===');
            console.log('Request body keys:', Object.keys(req.body));
            console.log('Request files present?', !!req.files);
            console.log('Request files type:', typeof req.files);
            console.log('Request files:', req.files);
            const filesArray = Array.isArray(req.files) ? req.files : (req.files ? Object.values(req.files).flat() : []);
            console.log('Files array:', filesArray);
            console.log('Files count:', filesArray.length);
            filesArray.forEach((file: any, idx: number) => {
                console.log(`  File ${idx}:`, file.fieldname, file.originalname, file.filename, file.size);
            });
            
            const parsedBody = this.parseFormData(req.body);
            console.log('Parsed body images:', parsedBody.images);
            
            const parseData = CreateAccommodationDTO.safeParse(parsedBody);
            if (!parseData.success) {
                console.log('Validation error:', z.prettifyError(parseData.error));
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const adminId = (req.user as { _id?: string } | undefined)?._id;
            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            // Handle uploaded images
            const uploadedImages = (req.files as Express.Multer.File[])?.map(
                (file) => `/uploads/${file.filename}`
            ) || [];
            
            console.log('Uploaded image paths:', uploadedImages);
            
            // Merge uploaded images with URL-based images from body
            const existingImages = parseData.data.images || [];
            console.log('Images from parsed body:', existingImages);
            
            const allImages = [...uploadedImages, ...existingImages];
            console.log('Final merged images:', allImages);

            const newAccommodation = await accommodationService.createAccommodation({
                ...parseData.data,
                images: allImages,
                createdBy: adminId,
            });
            
            console.log('Accommodation created with images:', newAccommodation.images);
            
            return res.status(201).json({
                success: true,
                message: "Accommodation created successfully",
                data: newAccommodation,
            });
        } catch (error: Error | any) {
            console.log('Error creating accommodation:', error.message);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    getAccommodationById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const accommodation = await accommodationService.getAccommodationById(id);
            console.log('Fetching accommodation by ID:', id);
            console.log('Accommodation images:', accommodation.images);
            return res.status(200).json({
                success: true,
                data: accommodation,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    getAllAccommodations = async (req: Request, res: Response) => {
        try {
            const accommodations = await accommodationService.getAllAccommodations();
            console.log('Fetching all accommodations, count:', accommodations.length);
            if (accommodations.length > 0) {
                console.log('First accommodation images:', accommodations[0].images);
            }
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    getActiveAccommodations = async (req: Request, res: Response) => {
        try {
            const accommodations = await accommodationService.getActiveAccommodations();
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    updateAccommodation = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            console.log('=== UPDATE ACCOMMODATION ===');
            console.log('Accommodation ID:', id);
            console.log('Request body raw (selected fields):', {
                name: req.body.name,
                isActive: req.body.isActive,
                isActiveType: typeof req.body.isActive,
            });
            console.log('Request files present?', !!req.files);
            const filesArray = Array.isArray(req.files) ? req.files : (req.files ? Object.values(req.files).flat() : []);
            console.log('Files count:', filesArray.length);
            filesArray.forEach((file: any, idx: number) => {
                console.log(`  File ${idx}:`, file.fieldname, file.originalname, file.filename);
            });
            
            const parsedBody = this.parseFormData(req.body);
            console.log('Parsed isActive:', parsedBody.isActive, 'type:', typeof parsedBody.isActive);
            const parseData = UpdateAccommodationDTO.safeParse(parsedBody);
            if (!parseData.success) {
                console.log('DTO validation error:', z.prettifyError(parseData.error));
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            console.log('After DTO parse, isActive:', parseData.data.isActive);
            // Handle uploaded images
            const uploadedImages = (req.files as Express.Multer.File[])?.map(
                (file) => `/uploads/${file.filename}`
            ) || [];
            
            console.log('Uploaded images:', uploadedImages);
            
            // Merge uploaded images with existing URL-based images from body
            const existingImages = parseData.data.images || [];
            console.log('Existing images from body:', existingImages);
            
            const allImages = uploadedImages.length > 0 || existingImages.length > 0 
                ? [...uploadedImages, ...existingImages] 
                : undefined;
            
            console.log('Final images for update:', allImages);
            console.log('Calling updateAccommodation with:', {
                isActive: parseData.data.isActive,
                updatePayload: {
                    ...parseData.data,
                    ...(allImages && { images: allImages })
                }
            });

            const updatedAccommodation = await accommodationService.updateAccommodation(
                id,
                {
                    ...parseData.data,
                    ...(allImages && { images: allImages })
                }
            );
            return res.status(200).json({
                success: true,
                message: "Accommodation updated successfully",
                data: updatedAccommodation,
            });
        } catch (error: Error | any) {
            console.log('Update error:', error.message);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    deleteAccommodation = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await accommodationService.deleteAccommodation(id);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    searchAccommodations = async (req: Request, res: Response) => {
        try {
            const { query } = req.query;
            if (!query || typeof query !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required",
                });
            }
            const results = await accommodationService.searchAccommodations(query);
            return res.status(200).json({
                success: true,
                data: results,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };

    getAccommodationsByPrice = async (req: Request, res: Response) => {
        try {
            const { minPrice, maxPrice } = req.query;
            if (!minPrice || !maxPrice) {
                return res.status(400).json({
                    success: false,
                    message: "Min and max price are required",
                });
            }
            const accommodations = await accommodationService.getAccommodationsByPriceRange(
                parseFloat(minPrice as string),
                parseFloat(maxPrice as string)
            );
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    };
}
