import type { components, paths } from '@devhub-404/api-contract';

export type AccountRestrictionDTO = components['schemas']['AccountRestrictionDTO'];
export type AccountStandingDTO = components['schemas']['GetAccountStandingOutputDTO'];
export type RestrictAccountCapabilityDTO = components['schemas']['RestrictAccountCapabilityInputDTO'];
export type RevokeAccountRestrictionDTO = components['schemas']['RevokeAccountRestrictionInputDTO'];
export type SuspendUserDTO = components['schemas']['SuspendAccountDTO'];
export type UpdateUserRolesDTO = components['schemas']['AssignAccountRolesDTO'];
export type UserRole = NonNullable<components['schemas']['AssignAccountRolesDTO']['role']>;
export type UsersListQuery = NonNullable<paths['/api/v1/accounts']['get']['parameters']['query']>;
export type UserListItemDTO = components['schemas']['AccountAdminUserDTO'];
export type UsersPageDTO = components['schemas']['AccountAdminUsersPageDTO'];
