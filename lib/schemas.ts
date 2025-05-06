import { z } from 'zod';

/**
 * Schema for a constituent - artist associated with an artwork
 */
export const constituentSchema = z.object({
  constituentID: z.number().int(),
  role: z.string(),
  name: z.string(),
  constituentULAN_URL: z.string().url().optional().nullable(),
  constituentWikidata_URL: z.string().url().optional().nullable(),
  gender: z.string().optional().nullable()
});

/**
 * Schema for measurement details of an artwork element
 */
export const measurementElementSchema = z.object({
  elementName: z.string(),
  elementDescription: z.string().optional().nullable(),
  elementMeasurements: z.record(z.string(), z.number())
});

/**
 * Schema for tags associated with an artwork
 */
export const tagSchema = z.object({
  term: z.string(),
  AAT_URL: z.string().url().optional().nullable(),
  Wikidata_URL: z.string().url().optional().nullable()
});

/**
 * Schema for a department in the museum
 */
export const departmentSchema = z.object({
  departmentId: z.number().int(),
  displayName: z.string()
});
export type Department = z.infer<typeof departmentSchema>;

/**
 * Comprehensive schema for the details of a museum object
 * Fields are generally optional and nullable to accommodate variations in API responses
 * Some fields are not present in all responses
 */
export const objectDetailsSchema = z.object({
  objectID: z.number().int(),
  objectName: z.string(),
  title: z.string(),
  isHighlight: z.boolean().optional(), // Optional, might be absent
  accessionNumber: z.string().optional().nullable(),
  accessionYear: z.string().optional().nullable(),
  isPublicDomain: z.boolean().optional(),
  primaryImage: z.string().url().optional().nullable(),
  primaryImageSmall: z.string().url().optional().nullable(),
  additionalImages: z.array(z.string().url()).optional().nullable(),
  constituents: z.array(constituentSchema).optional().nullable(),
  department: z.string().optional().nullable(),
  culture: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
  dynasty: z.string().optional().nullable(),
  reign: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
  artistRole: z.string().optional().nullable(),
  artistPrefix: z.string().optional().nullable(),
  artistDisplayName: z.string().optional().nullable(),
  artistDisplayBio: z.string().optional().nullable(),
  artistSuffix: z.string().optional().nullable(),
  artistAlphaSort: z.string().optional().nullable(),
  artistNationality: z.string().optional().nullable(),
  artistBeginDate: z.string().optional().nullable(),
  artistEndDate: z.string().optional().nullable(),
  artistWikidata_URL: z.string().url().optional().nullable(),
  artistULAN_URL: z.string().url().optional().nullable(),
  objectDate: z.string().optional().nullable(),
  objectBeginDate: z.number().int().optional().nullable(),
  objectEndDate: z.number().int().optional().nullable(),
  medium: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  measurements: z.array(measurementElementSchema).optional().nullable(),
  creditLine: z.string().optional().nullable(),
  geographyType: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  county: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  subregion: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  locus: z.string().optional().nullable(),
  excavation: z.string().optional().nullable(),
  river: z.string().optional().nullable(),
  classification: z.string().optional().nullable(),
  rightsAndReproduction: z.string().optional().nullable(),
  linkResource: z.string().url().optional().nullable(),
  metadataDate: z.string().datetime({ offset: true }).optional().nullable(),
  repository: z.string().optional().nullable(),
  objectURL: z.string().url().optional().nullable(),
  tags: z.array(tagSchema).optional().nullable(),
  objectType: z.string().optional().nullable(),
  isTimelineWork: z.boolean().optional().nullable().default(false),
  isMetOnDisplay: z.boolean().optional().nullable(),
  metStartDate: z.string().datetime({ offset: true }).optional().nullable(),
  metEndDate: z.string().datetime({ offset: true }).optional().nullable(),
  geographicLocations: z.string().optional().nullable(),
  relevance: z.string().optional().nullable(),
  iconDisplayName: z.string().optional().nullable(),
  verificationLevelDescription: z.string().optional().nullable(),
  constituentCount: z.number().int().optional().nullable(),
  upcomingExhibitionsCount: z.number().int().optional().nullable(),
  popularity: z.number().optional().nullable(),
  relatedResources: z.array(z.unknown()).optional().nullable(),
  artistGender: z.string().optional().nullable(),
  objectWikidata_URL: z.string().url().optional().nullable(),
  GalleryNumber: z.string().optional().nullable()
});

export type ObjectDetails = z.infer<typeof objectDetailsSchema>;

/**
 * Schema for search parameters.
 */
export const searchParamsSchema = z.object({
  q: z.string(),
  departmentIds: z.array(z.number().int().positive()).optional(),
  isHighlight: z.boolean().optional(),
  geoLocation: z.string().optional(),
  medium: z.string().optional(),
  classification: z.string().optional(),
  culture: z.string().optional(),
  artistOrCulture: z.boolean().optional(),
  dates: z.boolean().optional()
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
