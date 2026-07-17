import employeeService from './employee.service';

const departmentService = {
  getOptions: async () => {
    const response = await employeeService.getList({ limit: 1000 });
    const departments = (response.employeeList || [])
      .map((employee) => employee.department)
      .filter(Boolean);

    const uniqueDepartments = [...new Set(departments)].sort((a, b) => a.localeCompare(b));

    return uniqueDepartments.map((department) => ({
      value: department,
      label: department,
    }));
  },
};

export default departmentService;
