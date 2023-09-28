import { systemRoles } from "../../../Utils/systemRoles.js";

export const subCategoryAPIsRoles = {
    GET_ALL_CATEGORY: [systemRoles.USER],
    DELETE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
}