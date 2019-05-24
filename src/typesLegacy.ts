// TYPES PORTED FROM LEGACY FLOW CODEBASE

/**
 * URL Params with some pre defined
 * @deprecated
 */
export interface Params {
  sort_by?: string;
  types?: string;
}

/**
 * Legacy filter function type
 * @deprecated
 */
export type LegacyFilterFunction = (entity: any) => boolean;

/**
 * An array of the requested api object. Generally based on a template
 * @deprecated
 */
export type Payload = any[];
