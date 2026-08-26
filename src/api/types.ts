import type { components, paths } from '../../generated/api/schemas';

/**
 * Zugriff auf ein einzelnes Schema/DTO per Name.
 * @example type Group = Schema<'UserGroupResponse'>;
 */
export type Schema<Name extends keyof components['schemas']> = components['schemas'][Name];

/** Extrahiert den 200-JSON-Response-Body einer Operation */
type SuccessBody<Op> = Op extends {
    responses: { 200: { content: { 'application/json': infer R } } };
  }
  ? R
  : never;

/**
 * Response-Typ eines GET-Endpunkts direkt über den Pfad.
 * Praktisch, wenn der Endpunkt kein 1:1-Schema zurückgibt (z. B. ein Array
 * oder eine Projektion).
 * @example type Groups = GetResponse<'/api/users/{user-id}/user-groups'>;
 */
export type GetResponse<Path extends keyof paths> =
  paths[Path] extends { get: infer Op } ? SuccessBody<Op> : never;
