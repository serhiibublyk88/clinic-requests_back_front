//app.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointmentForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullName = document.getElementById("fullName")?.value;
      const phoneNumber = document.getElementById("phoneNumber")?.value;
      const issueDescription =
        document.getElementById("issueDescription")?.value;

      if (!fullName || !phoneNumber || !issueDescription) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const response = await fetch("/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            phone: phoneNumber,
            description: issueDescription,
          }),
        });

        if (response.ok) {
          const overlay = document.getElementById("overlay");
          if (overlay) {
            overlay.classList.remove("d-none");
            overlay.querySelector("#successMessage").innerText =
              "Your appointment has been submitted successfully!";
            form.reset();

            const hideOverlay = () => {
              overlay.classList.add("d-none");
              overlay.removeEventListener("click", hideOverlay);
            };
            overlay.addEventListener("click", hideOverlay);
          }
        } else {
          const errorData = await response.json();
          alert(
            errorData.errors
              ? errorData.errors.map((e) => e.msg).join(", ")
              : errorData.message
          );
        }
      } catch (error) {
        alert("There was a network error. Please try again later.");
      }
    });
  }

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        const response = await fetch("/auth/logout", {
          method: "POST",
        });

        if (response.ok) {
          window.location.href = "/";
        } else {
          alert("Failed to log out. Please try again.");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }

  document.querySelectorAll(".change-status").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const requestId = button.closest("tr")?.getAttribute("data-id");
      const currentStatus = button
        .closest("tr")
        ?.querySelector(".status-cell span")
        ?.innerText.toLowerCase();

      if (!requestId || !currentStatus) return;

      const newStatus = currentStatus === "pending" ? "completed" : "pending";

      try {
        const response = await fetch(`/requests/${requestId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          const updatedRequest = await response.json();
          const statusCell = button
            .closest("tr")
            ?.querySelector(".status-cell");
          const icon = button.querySelector("i");

          if (newStatus === "completed") {
            if (icon) icon.className = "fas fa-check-circle text-success";
            if (statusCell)
              statusCell.innerHTML =
                "<span class='badge badge-success'>completed</span>";
          } else {
            if (icon) icon.className = "fas fa-circle text-warning";
            if (statusCell)
              statusCell.innerHTML =
                "<span class='badge badge-warning'>pending</span>";
          }
        } else {
          alert("Failed to update status. Please try again.");
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    });
  });

  document.querySelectorAll(".delete-request").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const requestId = button.closest("tr")?.getAttribute("data-id");

      if (confirm("Are you sure you want to delete this request?")) {
        try {
          const response = await fetch(`/requests/${requestId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            button.closest("tr")?.remove();
          } else {
            alert("Failed to delete request. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting request:", error);
        }
      }
    });
  });

  let dateAsc = true;
  let nameAsc = true;

  const sortByDateButton = document.getElementById("sortByDate");
  if (sortByDateButton) {
    sortByDateButton.addEventListener("click", () => {
      const sortIcon = document.getElementById("sortByDateIcon");
      if (sortIcon) {
        dateAsc = !dateAsc;
        sortIcon.className = dateAsc
          ? "fas fa-sort-amount-down"
          : "fas fa-sort-amount-up";
        sortTable("date", dateAsc ? "asc" : "desc");
      }
    });
  }

  const sortByNameButton = document.getElementById("sortByName");
  if (sortByNameButton) {
    sortByNameButton.addEventListener("click", () => {
      const sortIcon = document.getElementById("sortByNameIcon");
      if (sortIcon) {
        nameAsc = !nameAsc;
        sortIcon.className = nameAsc
          ? "fas fa-sort-alpha-down"
          : "fas fa-sort-alpha-up";
        sortTable("name", nameAsc ? "asc" : "desc");
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll("#requestTableBody tr");

      rows.forEach((row) => {
        const cells = row.getElementsByTagName("td");
        let isVisible = false;
        Array.from(cells).forEach((cell) => {
          if (cell.textContent.toLowerCase().includes(query)) {
            isVisible = true;
          }
        });

        row.style.display = isVisible ? "" : "none";
      });
    });
  }

  function sortTable(criteria, order) {
    const tbody = document.getElementById("requestTableBody");
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
      let aValue, bValue;
      if (criteria === "date") {
        aValue = new Date(a.cells[0].textContent);
        bValue = new Date(b.cells[0].textContent);
      } else if (criteria === "name") {
        aValue = a.cells[1].textContent.toLowerCase();
        bValue = b.cells[1].textContent.toLowerCase();
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    rows.forEach((row) => tbody.appendChild(row));
  }
});
