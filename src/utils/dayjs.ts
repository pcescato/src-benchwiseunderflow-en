import { SITE_LANGUAGE } from "@config";
import dayjs from "dayjs";

// Import all supported locales
import "dayjs/locale/en";
import "dayjs/locale/fr";

// Set the default locale from the site configuration
// @ts-expect-error - TypeScript
dayjs.locale(SITE_LANGUAGE);

// Export the configured dayjs
export default dayjs;
