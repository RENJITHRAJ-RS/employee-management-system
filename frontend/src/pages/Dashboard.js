import { useEffect, useState } from "react";
import API from "../services/api";
import EmployeeModal from "../components/EmployeeModal";
import "./Dashboard.css";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔥 Departments from backend
  const [departments, setDepartments] = useState([]);

  // 🔥 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ======================
  // AUTH CHECK + FETCH
  // ======================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    } else {
      fetchEmployees();
      fetchDepartments(); // 🔥 NEW
    }
  }, []);

  // ======================
  // FETCH EMPLOYEES
  // ======================
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // ======================
  // FETCH DEPARTMENTS
  // ======================
  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.log("Department fetch error:", err);
    }
  };

  // ======================
  // ADD / EDIT
  // ======================
  const handleSave = async (data) => {
    try {
      if (editData) {
        await API.put(`/employees/${editData.id}`, data);
        alert("Employee updated successfully ✅");
      } else {
        await API.post("/employees", data);
        alert("Employee added successfully ✅");
      }

      setModalOpen(false);
      setEditData(null);
      fetchEmployees();
    } catch (err) {
      console.log("SAVE ERROR:", err);
      alert("Something went wrong!");
    }
  };

  // ======================
  // DELETE
  // ======================
  const deleteEmployee = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/employees/${deleteId}`);
      alert("Employee deleted successfully ✅");

      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      console.log("DELETE ERROR:", err);
      alert("Delete failed");
    }
  };

  // ======================
  // EDIT
  // ======================
  const openEdit = (emp) => {
    setEditData(emp);
    setModalOpen(true);
  };

  // ======================
  // LOGOUT
  // ======================
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ======================
  // FILTER (UPDATED 🔥)
  // ======================
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (department === "" ||
        emp.departments?.some((d) => d.name === department))
    );
  });

  // ======================
  // PAGINATION
  // ======================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentEmployees = filteredEmployees.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="header">
        <h1>Employee Details</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Search employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* 🔥 UPDATED DROPDOWN */}
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Filter by Department</option>

          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>

        <button
          className="add-btn"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Salary</th>
              <th>Departments</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.age}</td>
                  <td>₹{emp.salary}</td>

                  {/* 🔥 MULTIPLE DEPARTMENTS */}
                  <td>
                    {emp.departments
                      ?.map((d) => d.name)
                      .join(", ")}
                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => openEdit(emp)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteEmployee(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ⬅ Prev
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next ➡
        </button>
      </div>

      {/* MODAL */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
        departments={departments}
      />

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>
                Yes
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal">
          <div className="modal-content">
            <h3>Delete Employee</h3>
            <p>Are you sure you want to delete this employee?</p>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}