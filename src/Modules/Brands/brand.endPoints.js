import { systemRoles } from "../../Utils/systemRoles.js";

export const brandApisRoles = {
    GET_ALL_BRAND: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    CREATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    UPDATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    DELETE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
}
