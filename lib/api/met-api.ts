import { departmentSchema, objectDetailsSchema } from '@/lib/schemas'; // Assuming these are Zod schemas
import type { Department, ObjectDetails, SearchParams } from '@/lib/types';
import { z } from 'zod';

/**
 * Configuration for Next.js fetch caching
 */
export interface CacheConfig {
  /** Standard fetch cache option */
  cache?: RequestCache;
  /** Next.js specific revalidation time in seconds */
  revalidate?: number;
}

/**
 * Zod schema for response structures returning a list of object IDs and a total count
 */
const objectListResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  objectIDs: z.array(z.number().int().positive()).nullable()
});
/** TypeScript type inferred from objectListResponseSchema */
type ObjectListResponse = z.infer<typeof objectListResponseSchema>;

/**
 * Zod schema for the response structure of the departments endpoint
 */
const departmentsResponseSchema = z.object({
  departments: z.array(departmentSchema)
});

const API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

/** Symbol to indicate that a resource was not found (HTTP 404) */
export const NOT_FOUND = Symbol('NOT_FOUND');

/**
 * Custom error class for API-specific issues encountered when interacting with the Met Museum API
 */
export class MetApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'MetApiError';

    Object.setPrototypeOf(this, MetApiError.prototype);
  }
}

/**
 * Builds RequestInit object for fetch, incorporating Next.js cache options

 * @param cacheConfig - Optional cache configuration
 * @returns RequestInit object or undefined
 */
function buildRequestInit(cacheConfig?: CacheConfig): RequestInit | undefined {
  if (!cacheConfig) {
    return undefined;
  }

  if (cacheConfig.cache) {
    return { cache: cacheConfig.cache };
  }

  if (typeof cacheConfig.revalidate === 'number') {
    return { next: { revalidate: cacheConfig.revalidate } };
  }

  return undefined;
}

/**
 * Internal fetch wrapper for the Met Museum API
 * Handles common fetch logic, error handling, and basic response parsing
 *
 * @param url - The full URL to fetch
 * @param options - Standard fetch RequestInit options
 * @returns A Promise resolving to the parsed JSON data(T), null -> for empty 200/204 or unparsable JSON, or NOT_FOUND symbol
 * @throws {MetApiError} For API errors - non-2xx status codes other than 404
 * @throws {Error} For network errors or unexpected issues during fetch/parsing
 */
async function fetchApiInternal<T>(url: string, options?: RequestInit): Promise<T | null | typeof NOT_FOUND> {
  try {
    const response = await fetch(url, options);

    if (response.status === 404) {
      return NOT_FOUND;
    }

    if (!response.ok) {
      let errorBodyText = 'No error body received';

      try {
        errorBodyText = await response.text();
        /** Attempt to parse for a structured error message, but fall back gracefully */
        const errorJson = JSON.parse(errorBodyText);
        const message = errorJson.message || `API Error ${response.status}: ${response.statusText}`;

        throw new MetApiError(message, response.status, errorBodyText);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        /** If parsing JSON fails or text() fails, use the original text or a generic message */
        throw new MetApiError(
          `API Error ${response.status}: ${response.statusText}. Response: ${errorBodyText.substring(0, 500)}`,
          response.status,
          errorBodyText
        );
      }
    }

    /** Handle 204 No Content or other cases where body might be truly empty */
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    try {
      const data = await response.json();

      return data as T;
    } catch (jsonParseError) {
      if (jsonParseError instanceof SyntaxError) {
        console.warn(
          `fetchApiInternal: Successfully fetched but failed to parse JSON for URL ${url}. Response might be empty or not valid JSON. Status: ${response.status}. Returning null.`
        );

        return null;
      }
      throw new Error(
        /** For other errors during .json() */
        `Failed to parse API response JSON: ${
          jsonParseError instanceof Error ? jsonParseError.message : String(jsonParseError)
        }`
      );
    }
  } catch (error) {
    if (error instanceof MetApiError) {
      throw error;
    }
    console.error(`fetchApiInternal: Network or unexpected fetch error for URL ${url}:`, error);

    throw new Error(`Network or fetch error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches object IDs from the Met Museum API's /objects endpoint
 *
 * @param params - Optional parameters for filtering.
 * @param params.departmentIds - Department IDs - only the first ID is used if an array
 * @param params.metadataDate - Metadata date (YYYY-MM-DD)
 * @param cacheConfig - Optional Next.js cache configuration
 * @returns Promise resolving to total count and list of object IDs, or a default empty state on error/not found
 */
export async function fetchObjectIds(
  params: {
    departmentIds?: number | number[];
    metadataDate?: string;
  } = {},
  cacheConfig?: CacheConfig
): Promise<ObjectListResponse> {
  const endpointUrl = new URL(`${API_BASE_URL}/objects`);

  if (params.departmentIds) {
    const departmentId = Array.isArray(params.departmentIds) ? params.departmentIds[0] : params.departmentIds;

    if (typeof departmentId === 'number' && departmentId > 0) {
      endpointUrl.searchParams.append('departmentIds', String(departmentId));
    }
  }

  if (params.metadataDate) {
    endpointUrl.searchParams.append('metadataDate', params.metadataDate);
  }

  const requestInit = buildRequestInit(cacheConfig);
  const defaultResponse: ObjectListResponse = { total: 0, objectIDs: null };

  try {
    const rawData = await fetchApiInternal<unknown>(endpointUrl.toString(), requestInit);

    if (rawData === NOT_FOUND || rawData === null) {
      return defaultResponse;
    }

    const validationResult = objectListResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `fetchObjectIds: Failed to validate response data from ${endpointUrl.toString()}:`,
        validationResult.error.flatten()
      );

      return defaultResponse;
    }

    return validationResult.data;
  } catch (error) {
    console.error(
      `fetchObjectIds: Failed to fetch object IDs with params ${JSON.stringify(params)}:`,
      error instanceof MetApiError ? `${error.message} (Status: ${error.status})` : error
    );

    return defaultResponse;
  }
}

/**
 * Fetches detailed information for a specific object ID from the Met Museum API
 *
 * @param objectId - The ID of the object
 * @param cacheConfig - Optional Next.js cache configuration
 * @returns Promise resolving to object details, `{ notFound: true }` if 404, or `null` for other errors
 * @throws {Error} If `objectId` is invalid (not a positive integer)
 */
export async function fetchObjectDetails(
  objectId: number,
  cacheConfig?: CacheConfig
): Promise<ObjectDetails | null | { readonly notFound: true }> {
  if (!Number.isInteger(objectId) || objectId <= 0) {
    throw new Error(`Invalid object ID: ${objectId}. A positive integer is required.`);
  }

  const endpointUrl = `${API_BASE_URL}/objects/${objectId}`;
  const requestInit = buildRequestInit(cacheConfig);

  try {
    const rawData = await fetchApiInternal<unknown>(endpointUrl, requestInit);

    if (rawData === NOT_FOUND) {
      return { notFound: true } as const;
    }

    if (rawData === null) {
      console.warn(`fetchObjectDetails: Received null data for object ID ${objectId}, treating as fetch error.`);

      return null;
    }

    const validationResult = objectDetailsSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `fetchObjectDetails: Failed to validate object details for ID ${objectId}:`,
        validationResult.error.flatten()
      );

      return null;
    }

    const validatedData = validationResult.data;
    /** Ensure isTimelineWork conforms to the ObjectDetails interface */
    return {
      ...validatedData,
      isTimelineWork: validatedData.isTimelineWork ?? false
    };
  } catch (error) {
    console.error(
      `fetchObjectDetails: Failed to fetch details for object ID ${objectId}:`,
      error instanceof MetApiError ? `${error.message} (Status: ${error.status})` : error
    );

    return null;
  }
}

/**
 * Fetches all departments from the Met Museum API
 *
 * @param cacheConfig - Optional Next.js cache configuration
 * @returns Promise resolving to an object containing an array of departments, or empty array on error
 */
export async function fetchDepartments(cacheConfig?: CacheConfig): Promise<{ departments: Department[] }> {
  const endpointUrl = `${API_BASE_URL}/departments`;
  const requestInit = buildRequestInit(cacheConfig);
  const defaultResponse = { departments: [] };

  try {
    const rawData = await fetchApiInternal<unknown>(endpointUrl, requestInit);

    if (rawData === NOT_FOUND || rawData === null) {
      return defaultResponse;
    }

    const validationResult = departmentsResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `fetchDepartments: Failed to validate response data from ${endpointUrl}:`,
        validationResult.error.flatten()
      );

      return defaultResponse;
    }

    return { departments: validationResult.data.departments };
  } catch (error) {
    console.error(
      'fetchDepartments: Failed to fetch departments:',
      error instanceof MetApiError ? `${error.message} (Status: ${error.status})` : error
    );

    return defaultResponse;
  }
}

/**
 * Searches objects in the Met Museum API
 *
 * @param params - Search parameters. `q` is REQUIRED
 * @param cacheConfig - Optional Next.js cache configuration
 * @returns Promise resolving to total count and list of object IDs, or a default empty state on error
 * @throws {Error} If search query `q` is missing or empty
 */
export async function searchObjects(params: SearchParams, cacheConfig?: CacheConfig): Promise<ObjectListResponse> {
  if (!params.q || typeof params.q !== 'string' || params.q.trim() === '') {
    throw new Error("Search query parameter 'q' is required and cannot be empty.");
  }

  /** Default hasImages to true if not explicitly set */
  const hasImages = params.hasImages !== undefined ? params.hasImages : true;

  const endpointUrl = new URL(`${API_BASE_URL}/search`);

  endpointUrl.searchParams.append('q', params.q.trim());

  if (params.departmentId !== undefined && params.departmentId > 0) {
    endpointUrl.searchParams.append('departmentId', String(params.departmentId));
  }

  if (params.isHighlight !== undefined) {
    endpointUrl.searchParams.append('isHighlight', String(params.isHighlight));
  }

  if (params.isOnView !== undefined) {
    endpointUrl.searchParams.append('isOnView', String(params.isOnView));
  }

  if (params.artistOrCulture !== undefined) {
    endpointUrl.searchParams.append('artistOrCulture', String(params.artistOrCulture));
  }

  if (params.medium) {
    const mediaValue = Array.isArray(params.medium) ? params.medium.join('|') : params.medium;

    if (mediaValue.trim() !== '') {
      endpointUrl.searchParams.append('medium', mediaValue);
    }
  }

  /**  Always append hasImages (default true) */
  if (hasImages === true) {
    endpointUrl.searchParams.append('hasImages', 'true');
  } else if (hasImages === false) {
    endpointUrl.searchParams.append('hasImages', 'false');
  }

  if (params.geoLocation && params.geoLocation.trim() !== '') {
    endpointUrl.searchParams.append('geoLocation', params.geoLocation);
  }

  if (params.dateBegin !== undefined) {
    endpointUrl.searchParams.append('dateBegin', String(params.dateBegin));
  }

  if (params.dateEnd !== undefined) {
    endpointUrl.searchParams.append('dateEnd', String(params.dateEnd));
  }

  const requestInit = buildRequestInit(cacheConfig);
  const defaultResponse: ObjectListResponse = { total: 0, objectIDs: null };

  try {
    const rawData = await fetchApiInternal<unknown>(endpointUrl.toString(), requestInit);

    if (rawData === NOT_FOUND || rawData === null) {
      return defaultResponse;
    }

    const validationResult = objectListResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `searchObjects: Failed to validate response data from ${endpointUrl.toString()}:`,
        validationResult.error.flatten()
      );

      return defaultResponse;
    }
    return validationResult.data;
  } catch (error) {
    console.error(
      `searchObjects: Failed to search objects with params ${JSON.stringify(params)}:`,
      error instanceof MetApiError ? `${error.message} (Status: ${error.status})` : error
    );

    return defaultResponse;
  }
}
