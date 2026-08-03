const DEPARTMENTS = [
  {
    value: "CloudEngineer",
    label: "Cloud Engineer",
  },
  {
    value: "Developer",
    label: "Developer",
  },
  {
    value: "HR",
    label: "HR",
  },
  {
    value: "Intern",
    label: "Intern",
  },
];


const departmentService = {
  getOptions: async () => {
    return DEPARTMENTS;
  },
};

export default departmentService;