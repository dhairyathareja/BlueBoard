import { Role } from "../model/role.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import { PERMISSIONS } from "../utils/permissions.js";

export const postAddRole = ErrorWrapper(async (req, res, next) => {
  const { roleName, description, permissions = [] } = req.body;

  const requiredField = ["roleName", "description"];

  const incomingField = Object.keys(req.body);

  const missingField = requiredField.filter(
    (field) => !incomingField.includes(field),
  );

  if (missingField.length > 0) {
    throw new ErrorHandler(
      401,
      `Please Enter the Missing Fields: ${missingField.join(", ")}`,
    );
  }

  const validPermissions = Object.values(PERMISSIONS);

  const invalidPermissions = permissions.filter(
    (permission) => !validPermissions.includes(permission),
  );

  if (invalidPermissions.length > 0) {
    throw new ErrorHandler(
      401,
      `Invalid Permissions: ${invalidPermissions.join(", ")}`,
    );
  }

  try {
    const existingRole = await Role.exists({
      roleName,
      isDeleted: false,
    });

    if (existingRole) {
      throw new ErrorHandler(401, `Role ${roleName} already exists`);
    }

    const role = await Role.create({
      roleName,
      description,
      permissions,
    });

    res.status(201).json({
      success: true,
      message: `Role ${role.roleName} Added Successfully`,
    });
  } catch (error) {
    throw new ErrorHandler(501, "Can't Add Role. Please try again later.");
  }
});

export const getRoleList = ErrorWrapper(async (req, res, next) => {
  let { page = 1, limit = 10, search } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (page <= 0 || limit <= 0) {
    throw new ErrorHandler(400, "Page and Limit must be greater than 0");
  }

  let filter = {
    isDeleted: false,
  };

  if (search) {
    filter.roleName = {
      $regex: search,
      $options: "i",
    };
  }

  try {
    const totalRole = await Role.countDocuments(filter);

    const roleList = await Role.find(filter)
      .select("-__v")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRole / limit),
      totalRole,
      roleList,
    });
  } catch (error) {
    throw new ErrorHandler(
      501,
      "Can't Fetch Role List. Please try again later.",
    );
  }
});

export const postUpdateRole = ErrorWrapper(async (req, res, next) => {
  const { roleId, description, permissions = [] } = req.body;

  const requiredField = ["roleId", "description"];

  const incomingField = Object.keys(req.body);

  const missingField = requiredField.filter(
    (field) => !incomingField.includes(field),
  );

  if (missingField.length > 0) {
    throw new ErrorHandler(
      401,
      `Please Enter the Missing Fields: ${missingField.join(", ")}`,
    );
  }

  const validPermissions = Object.values(PERMISSIONS);

  const invalidPermissions = permissions.filter(
    (permission) => !validPermissions.includes(permission),
  );

  if (invalidPermissions.length > 0) {
    throw new ErrorHandler(
      401,
      `Invalid Permissions: ${invalidPermissions.join(", ")}`,
    );
  }

  try {
    const role = await Role.findById(roleId);

    if (!role || role.isDeleted) {
      throw new ErrorHandler(404, "Role not found");
    }

    await Role.findByIdAndUpdate(roleId, {
      description,
      permissions,
    });

    res.status(200).json({
      success: true,
      message: `Role ${role.roleName} Updated Successfully`,
    });
  } catch (error) {
    throw new ErrorHandler(501, "Can't Update Role. Please try again later.");
  }
});

export const postDeleteRole = ErrorWrapper(async (req, res, next) => {
  const { roleId } = req.body;

  const requiredField = ["roleId"];

  const incomingField = Object.keys(req.body);

  const missingField = requiredField.filter(
    (field) => !incomingField.includes(field),
  );

  if (missingField.length > 0) {
    throw new ErrorHandler(
      401,
      `Please Enter the Missing Fields: ${missingField.join(", ")}`,
    );
  }

  try {
    const role = await Role.findOneAndUpdate(
      {
        _id: roleId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      },
    );

    if (!role) {
      throw new ErrorHandler(404, "Role not found");
    }

    res.status(200).json({
      success: true,
      message: `Role ${role.roleName} Deleted Successfully`,
    });
  } catch (error) {
    throw new ErrorHandler(501, "Can't Delete Role. Please try again later.");
  }
});
