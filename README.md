This application allows users to browse the Metropolitan Museum of Art's collection using their public API.

**Tech Stack:**

* [pnpm for package management](https://pnpm.io/)
* [Next.js v15.3.1 (App Router)](https://www.typescriptlang.org/docs/)
* [React v19.1](https://react.dev/)
* [TypeScript](https://www.typescriptlang.org/docs/)
* [TailwindCSS v4.1.5](https://tailwindcss.com/)
* [Shadcn/UI](https://ui.shadcn.com/docs/components)
* [Radix/UI](https://www.radix-ui.com/)
* [Lucide Icons](https://lucide.dev/)
* [Zod](https://zod.dev/?id=or)
* [nuqs type-safe search params state management](https://nuqs.47ng.com/)
* [Biome for linting and formatting](https://biomejs.dev/)
* [Vercel](https://vercel.com/new)


### Design Decisions
*   **Architecture:** Next.js App Router and utilize React Server Components when and where it should be used. Client Components, `'use client'`, I will try to minimize the use and hopefully use them primarily for user interactions.
*   **State Management:** Currently my plan is to use `React Context` but may change my mind later.
*   **Data Fetching:**
    *   A dedicated module `src/lib/met-api.ts` to encapsulate all interactions with the Met Museum API.
    *   Will utilize `fetch` for making requests and Zod for parsing and validating API responses.
*   **Routing:**
    *   `/` and `/objects`: Main page for browsing/searching objects. This page will be paginated and allow filtering by department and searching by query.
    *   `/objects/[objectId]`: Details page for a single art object.
*   **Error Handling:** Utilize Next.js conventions like `error.tsx` for route-level errors and `notFound()` for 404 scenarios.
*   **Code Style:** Will be adhering to functional programming patterns, descriptive naming, modularity, and TypeScript best practices as outlined in the challenge description. Biome will enforce formatting and linting rules **Yeah BOY!**.    

---

## Project Goals & Features
* [ ] Paginated display of objects
* [ ] View for individual object details
* [ ] Filter objects by department
* [ ] Search for objects by ID
* [ ] Search for objects by title/query
* [ ] Mobile-responsive interface
* [ ] Stylized interface using Radix UI

**API Documentation:** [https://metmuseum.github.io/](https://metmuseum.github.io/)

## Development Log

### Setup & Initial Structure (Phase 1)

* **Goal:** Set up the basic Next.js project structure, install dependencies (Radix UI, Lucide Icons, Zod, Biome), and set up the project files and directories

* **Tasks:**
    * Initialize Next.js project (manual step assumed)
    * Install `zod`, `biome`, `lucide-icons`, and `radix-ui`
    * Set up project files and directories
    * Update `README.md`

* **Progress:**
Update at a later time

### Component Implementation & Data Fetching (Phase 2)

* **Goal:** API definions, fetch functions, and 

* Define API endpoint constants
    * Create `lib/met-api.ts` for API fetching logic.
        * `fetchDepartments()`: Fetches the list of departments
        * `searchObjects(params)`: Searches objects based on query, department, etc. Returns object IDs and total count
        * `fetchObjectDetails(objectId)`: Fetches details for a single object
    * Define TypeScript types for API responses (`Department`, `ObjectSearchResult`, `ObjectDetails`)
    * Create `app/layout.tsx` with basic HTML structure, Tailwind integration, and font setup
    * Create `app/page.tsx` as the main entry point
        * Fetch departments server-side or client-side for the filter
        * Set up placeholders for ``search-bar`, `dropdown-filter`, `object-grid`, `object-card`, `and pagination-controls`

    * Starting with basic API functions. Error handling and loading states will be added progressively
* **Thinking:** Do I want to implement or use the `nuqs` library to handle URL search paramaters? Leaning toward YES!
* **Progress:** Initial structure and API utilities defined. `schema.ts` is done, what a pain   Main page layout created with placeholders
* **Next Steps:** Implement the actual components - `search-bar`, `dropdown-filter`, `object-grid`, `object-card`, `pagination-controls`, and I'm sure many others... then integrate them into `page.tsx`. Fetch and display data.


### Constraints Noted:
*   The application will rely solely on the Met Museum's public API. No backend database will be used for caching or storing data beyond URL state managed by `nuqs`.
*    Many fields in `objectDetailsSchema` should be `.optional()` or `.nullable()` b/c not all objects have all data points.


### Custom component/hooks creation & downloading of ShadUI/React components
`
* **Goal:** Create modular/reusable, clear and readable components

* Determined the components needed from Shadcn UI and installed them. Shadcn is not a component library, it gives you a component's code but devs have control over to customize and extend the components to match their their needs.
    * Using the `pnpm dlx shadcn@latest add some-component`, and you can install all the components you need in one command, `pnpm dlx shadcn@latest add componeONE componentTWO etcComponent`
    * Defined and finished hooks but I designed them for client-side fetching and state management.
    * Defined and finished a few custom components: 
      - `department-filter.tsx`
      - `filter-dropdown.tsx`
      - `object-card.tsx`
      - `object-grid.tsx`
      - `object-image.tsx`
      - `pagination-controls.tsx`
      - `pagination-section.tsx`
      - `search-bar.tsx`
      - `show-only-filer.tsx`
    * Added the `nuqs` library
    * Added `error.tsx`, `page.tsx`, and `loading.tsx` to the `./app/objects/[id]` directory
    * Created `app/page.tsx` as the main entry point
        * Fetch departments client-side for the filter

* **Thinking:** Need to go back and refactor my custom `hooks` and `components` to utilize Server Side Rendering. That was one of my main goals but fail fast.
* **Progress:** Knocked out quite a bit in this phase, many things out of scope but time is limited.
* **Next Steps:** Create `object-details-client.tsx`


### Constraints Noted:
*   The application will rely solely on the Met Museum's public API. No backend database will be used for caching or storing data beyond URL state managed by `nuqs`.
*    Many fields in `objectDetailsSchema` should be `.optional()` or `.nullable()` b/c not all objects have all data points.



- Added `nuqs` for type-safe URL search parameter management


