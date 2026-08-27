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
const [employees, setEmployees] = useState([]);

  const [showForm, setShowForm] = useState(false);
const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "Cashier",
    phone: "",
    status: "Active",
  });
useEffect(() => {
  const loadEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load employees.");
      }

      const formattedEmployees = data.map((employee) => ({
        id: employee.Id,
        name: employee.Name,
        role: employee.Role,
        phone: employee.Phone,
        status: employee.Status,
      }));

      setEmployees(formattedEmployees);
    } catch (error) {
      alert(error.message);
    }
  };

  loadEmployees();
}, []);

const handleAddEmployee = async () => {
  if (newEmployee.name.trim() === "" || newEmployee.phone.trim() === "") {
    alert("Please enter employee name and phone number.");
    return;
  }

  try {
    const isEditing = editingEmployeeId !== null;
    const url = isEditing
      ? `http://localhost:5000/api/employees/${editingEmployeeId}`
      : "http://localhost:5000/api/employees";

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(newEmployee),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save employee.");
    }

    const savedEmployee = {
      id: data.Id,
      name: data.Name,
      role: data.Role,
      phone: data.Phone,
      status: data.Status,
    };

    if (isEditing) {
      setEmployees(
        employees.map((employee) =>
          employee.id === editingEmployeeId ? savedEmployee : employee,
        ),
      );
    } else {
      setEmployees([savedEmployee, ...employees]);
    }

    setNewEmployee({
      name: "",
      role: "Cashier",
      phone: "",
      status: "Active",
    });

    setEditingEmployeeId(null);
    setShowForm(false);
  } catch (error) {
    alert(error.message);
  }
};
  
const handleEditEmployee = (employee) => {
  setNewEmployee({
    name: employee.name,
    role: employee.role,
    phone: employee.phone,
    status: employee.status,
  });

  setEditingEmployeeId(employee.id);
  setShowForm(true);
};
 const handleDeleteEmployee = async (employeeId) => {
   const confirmDelete = window.confirm(
     "Are you sure you want to delete this employee?",
   );

   if (!confirmDelete) return;

   try {
     const response = await fetch(
       `http://localhost:5000/api/employees/${employeeId}`,
       {
         method: "DELETE",
         headers: {
           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
         },
       },
     );

     const data = await response.json();

     if (!response.ok) {
       throw new Error(data.message || "Unable to delete employee.");
     }

     setEmployees(employees.filter((employee) => employee.id !== employeeId));
   } catch (error) {
     alert(error.message);
   }
 };
const handleToggleStatus = async (employeeId) => {
  const employee = employees.find((item) => item.id === employeeId);

  if (!employee) return;

  const updatedEmployee = {
    ...employee,
    status: employee.status === "Active" ? "Inactive" : "Active",
  };

  try {
    const response = await fetch(
      `http://localhost:5000/api/employees/${employeeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updatedEmployee),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to change employee status.");
    }

    setEmployees(
      employees.map((item) =>
        item.id === employeeId ? { ...item, status: data.Status } : item,
      ),
    );
  } catch (error) {
    alert(error.message);
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

          <button onClick={handleAddEmployee}>
            {editingEmployeeId !== null ? "Update Employee" : "Save Employee"}
          </button>

          <button
            className="cancel-employee-button"
            onClick={() => {
              setShowForm(false);
              setEditingEmployeeId(null);
              setNewEmployee({
                name: "",
                role: "Cashier",
                phone: "",
                status: "Active",
              });
            }}
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
                  <div className="employee-actions">
                    <div className="employee-actions-top">
                      <button
                        type="button"
                        className="edit-employee-button"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-employee-button"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <button
                      type="button"
                      className="status-employee-button"
                      onClick={() => handleToggleStatus(employee.id)}
                    >
                      {employee.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
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
