export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};

// export const isUserHR = (user) => {
//   if (!user) return false;
  
//   if (user.role && typeof user.role === 'object') {
//     if (user.role.permissions?.includes('EMPLOYEE_CREATE')) {
//       return true;
//     }
//   }

//   return false;
// };
export const isUserHR = (user) => {

    if (!user) return false;

    if (user.department?.toLowerCase() === "hr") {
        return true;
    }

    if (user.role && typeof user.role === "object") {
        return user.role.roleName === "BlueBoard-HR";
    }

    return false;
};