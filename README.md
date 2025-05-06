This application allows users to browse the Metropolitan Museum of Art's collection using their public API.

**Tech Stack:**

* [pnpm for package management](https://pnpm.io/)
* [Next.js v15.3.1 (App Router)](https://www.typescriptlang.org/docs/)
* [React v19.1](https://react.dev/)
* [TypeScript]()
* [TailwindCSS v4.1.5](https://tailwindcss.com/)
* [Radix UI](https://www.radix-ui.com/)
* [Lucide Icons](https://lucide.dev/)
* [Zod](tailwindcss-animate)
* [Biome for linting and formatting](https://biomejs.dev/)
* [Vercel](https://vercel.com/new)

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
* **Progress:** Initial structure and API utilities defined. Main page layout created with placeholders
* **Next Steps:** Implement the actual components - `search-bar`, `dropdown-filter`, `object-grid`, `object-card`, `pagination-controls` - and integrate them into `page.tsx`. Fetch and display data

