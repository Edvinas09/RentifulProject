import { Request, Response } from "express";
import { Location, Prisma, PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import axios from "axios";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      latitude,
      longitude,
      availableFrom,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      //Converting favoriteIds to an array of numbers
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMax)}`
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMax)}`
      );
    }

    if (propertyType && propertyType !== "any") {
      //Checking in enum PropertyType whether the propertyType is valid
      whereConditions.push(
        Prisma.sql`p."propertyType" >= ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereConditions.push(
        //Checking if the amenities array contains the amenities
        Prisma.sql`p."amenities" @> ${amenitiesArray}`
      );
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate && availableFrom && availableFrom !== "any") {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`Exists (SELECT 1 FROM "Lease" l WHERE l."propertyId" = p.id AND l."startDate" <= ${date.toISOString()} AND l."endDate" >= ${date.toISOString()})`
          );
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radius = 1000; // 1000 km radius
      const degrees = radius / 111; // Approximate conversion from km to degrees

      whereConditions.push(
        Prisma.sql`ST_DWithin( l.coordinates::geometry, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), ${degrees})`
      );
    }

    const completeQuery = Prisma.sql`
SELECT p.*,
        json_build_object(
            'id', l.id,
            'address', l.address,
            'city', l.city,
            'state', l.state,
            'country', l.country,
            'postalCode', l."postalCode",
            'coordinates', json_build_object(
                'latitude', ST_Y(l.coordinates::geometry),
                'longitude', ST_X(l.coordinates::geometry)
            )
        ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.locationId}`;
      const geoJson: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJson.coordinates[0];
      const latitude = geoJson.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            latitude,
            longitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${error.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...getPropertyData
    } = req.body;

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      })
    );
    //nominatim url for geocoding
    const geoCodingUrl = `   https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalCode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geoCodingResponse = await axios.get(geoCodingUrl, {
      //Need these headers to avoid CORS issues
      headers: {
        "User-Agent": "RealEstateProject (just4life45@gmail.com)",
      },
    });
    const [longitude, latitude] =
      geoCodingResponse.data[0]?.lon && geoCodingResponse.data[0]?.lat
        ? [
            parseFloat(geoCodingResponse.data[0]?.lon),
            parseFloat(geoCodingResponse.data[0]?.lat),
          ]
        : [0, 0];

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...getPropertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof getPropertyData.amenities === "string"
            ? getPropertyData.amenities.split(",")
            : [],
        highlights:
          typeof getPropertyData.highlights === "string"
            ? getPropertyData.highlights.split(",")
            : [],
        isPetsAllowed: getPropertyData.isPetsAllowed === "true",
        isParkingIncluded: getPropertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(getPropertyData.pricePerMonth),
        securityDeposit: parseFloat(getPropertyData.securityDeposit),
        applicationFee: parseFloat(getPropertyData.applicationFee),
        beds: parseInt(getPropertyData.beds),
        baths: parseFloat(getPropertyData.baths),
        squareFeet: parseInt(getPropertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },

    });

    res.status(201).json(newProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${error.message}` });
  }
};
