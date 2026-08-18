import { useEffect, useState } from "react";
import "./Employees.css";

const initialEmployees = [
  {
    id: 1,
    name: "Ali Khan",
    role: "Cashier",
    phone: "0300-1234567",
    status: "Active",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    role: "Manager",
    phone: "0311-7654321",
    status: "Active",
  },
];

function Employees() {
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = localStorage.getItem("employees");

    return savedEmployees ? JSON.parse(savedEmployees) : initialEmployees;
  });

  const [showForm, setShowForm] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "Cashier",
    phone: "",
    status: "Active",
  });

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const handleAddEmployee = () => {
    if (newEmployee.name.trim() === "" || newEmployee.phone.trim() === "") {
      alert("Please enter employee name and phone number.");
      return;
    }

    setEmployees([
      ...employees,
      {
        id: Date.now(),
        ...newEmployee,
        name: newEmployee.name.trim(),
        phone: newEmployee.phone.trim(),
      },
    ]);

    setNewEmployee({
      name: "",
      role: "Cashier",
      phone: "",
      status: "Active",
    });

    setShowForm(false);
  };

  const handleDeleteEmployee = (employeeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (confirmDelete) {
      setEmployees(employees.filter((employee) => employee.id !== employeeId));
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>Manage store employees and their roles.</p>
        </div>

        <button
          className="add-employee-button"
          onClick={() => setShowForm(true)}
        >
          + Add Employee
        </button>
      </div>

      {showForm && (
        <div className="employee-form">
          <input
            type="text"
            placeholder="Employee name"
            value={newEmployee.name}
            onChange={(event) =>
              setNewEmployee({
                ...newEmployee,
                name: event.target.value,
              })
            }
          />

          <select
            value={newEmployee.role}
            onChange={(event) =>
              setNewEmployee({
                ...newEmployee,
                role: event.target.value,
              })
            }
          >
            <option>Cashier</option>
            <option>Manager</option>
            <option>Salesperson</option>
            <option>Stock Manager</option>
          </select>

          <input
            type="text"
            placeholder="Phone number"
            value={newEmployee.phone}
            onChange={(event) =>
              setNewEmployee({
                ...newEmployee,
                phone: event.target.value,
              })
            }
          />

          <select
            value={newEmployee.status}
            onChange={(event) =>
              setNewEmployee({
                ...newEmployee,
                status: event.target.value,
              })
            }
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button onClick={handleAddEmployee}>Save Employee</button>

          <button
            className="cancel-employee-button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="employees-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.role}</td>
                <td>{employee.phone}</td>
                <td>
                  <span
                    className={
                      employee.status === "Active"
                        ? "employee-status active-employee"
                        : "employee-status inactive-employee"
                    }
                  >
                    {employee.status}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-employee-button"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;
