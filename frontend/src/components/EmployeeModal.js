import { useEffect, useRef, useState } from "react";
import API from "../services/api"; // 🔥 IMPORTANT
import "./EmployeeModal.css";

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  editData,
  departments,
  setDepartments, // 🔥 IMPORTANT
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    salary: "",
    department_ids: [],
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);

  // ======================
  // LOAD EDIT DATA
  // ======================
  useEffect(() => {
    if (editData) {
      const ids = editData.departments?.map((d) => d.id) || [];

      setForm({
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        age: editData.age,
        salary: editData.salary,
        department_ids: ids,
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        age: "",
        salary: "",
        department_ids: [],
      });
    }
  }, [editData, isOpen]);

  // ======================
  // CLOSE DROPDOWN
  // ======================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = () => {
    if (!form.name || !form.email) {
      alert("Name and Email required");
      return;
    }
    onSave(form);
  };

  // ======================
  // TOGGLE DEPARTMENT
  // ======================
  const toggleDepartment = (id) => {
    let updated;

    if (form.department_ids.includes(id)) {
      updated = form.department_ids.filter((d) => d !== id);
    } else {
      updated = [...form.department_ids, id];
    }

    setForm({ ...form, department_ids: updated });
  };

  // ======================
  // FILTER
  // ======================
  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // ======================
  // ADD NEW DEPARTMENT (🔥 FIXED)
  // ======================
  const handleAddDepartment = async () => {
    try {
      const res = await API.post("/departments", {
        name: search,
      });

      const newDept = res.data;

      // 🔥 UPDATE STATE
      setDepartments((prev) => [...prev, newDept]);

      // 🔥 AUTO SELECT
      setForm((prev) => ({
        ...prev,
        department_ids: [...prev.department_ids, newDept.id],
      }));

      setSearch("");
      setShowDropdown(false);
    } catch (err) {
      console.log(err);
      alert("Error creating department");
    }
  };

  // ======================
  // SELECTED
  // ======================
  const selectedDepartments = departments.filter((d) =>
    form.department_ids.includes(d.id)
  );

  return (
    <div className="modal">
      <div className="modal-content">

        <h2>{editData ? "Edit Employee" : "Add Employee"}</h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          placeholder="Age"
          value={form.age}
          onChange={(e) =>
            setForm({ ...form, age: e.target.value })
          }
        />

        <input
          placeholder="Salary"
          value={form.salary}
          onChange={(e) =>
            setForm({ ...form, salary: e.target.value })
          }
        />

        {/* 🔥 DROPDOWN */}
        <div className="dropdown-container" ref={dropdownRef}>

          {/* SELECTED */}
          <div
            className="selected-box"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {selectedDepartments.length > 0 ? (
              selectedDepartments.map((dept) => (
                <span key={dept.id} className="tag">
                  {dept.name}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDepartment(dept.id);
                    }}
                  >
                    ✕
                  </span>
                </span>
              ))
            ) : (
              <span className="placeholder">
                Select Departments
              </span>
            )}
          </div>

          {showDropdown && (
            <div className="dropdown">

              {/* SEARCH */}
              <input
                className="search-box"
                placeholder="Search department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* LIST */}
              {filtered.map((dept) => {
                const selected = form.department_ids.includes(dept.id);

                return (
                  <div
                    key={dept.id}
                    className={`dropdown-item ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    {dept.name} {selected && "✔"}
                  </div>
                );
              })}

              {/* ADD NEW */}
              {search &&
                !departments.some((d) => d.name === search) && (
                  <div className="add-new" onClick={handleAddDepartment}>
                    ➕ Add "{search}"
                  </div>
                )}
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>

      </div>
    </div>
  );
}