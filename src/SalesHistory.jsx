import "./SalesHistory.css";
import { useState } from "react";
function SalesHistory() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
const [searchTerm, setSearchTerm] = useState("");
const [paymentFilter, setPaymentFilter] = useState("All");
const [dateFilter, setDateFilter] = useState("");
const filteredSales = sales.filter((sale) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    String(sale.customer || "")
      .toLowerCase()
      .includes(search) ||
    String(sale.product || "")
      .toLowerCase()
      .includes(search);

  const matchesPayment =
    paymentFilter === "All" || sale.paymentMethod === paymentFilter;

  const saleDate = new Date(sale.date);

  const formattedSaleDate = Number.isNaN(saleDate.getTime())
    ? ""
    : `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(saleDate.getDate()).padStart(2, "0")}`;

  const matchesDate = dateFilter === "" || formattedSaleDate === dateFilter;

  return matchesSearch && matchesPayment && matchesDate;
});
const filteredRevenue = filteredSales.reduce(
  (sum, sale) => sum + Number(sale.total || 0),
  0,
);
const exportToCSV = () => {
  if (filteredSales.length === 0) {
    alert("No sales available to export.");
    return;
  }

  const headers = [
    "Customer",
    "Product",
    "Quantity",
    "Payment",
    "Total",
    "Date",
    "Status",
  ];

  const rows = filteredSales.map((sale) => [
    sale.customer,
    sale.product,
    sale.quantity,
    sale.paymentMethod,
    sale.total,
    sale.date,
    sale.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const file = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(file);
  downloadLink.download = "sales-report.csv";
  downloadLink.click();

  URL.revokeObjectURL(downloadLink.href);
};
  return (
    <div className="sales-history-page">
      <div className="sales-history-header">
        <h1>Sales History</h1>
        <p>View all completed customer sales.</p>
      </div>
      <div className="report-summary">
        <div>
          <span>Filtered Sales</span>
          <strong>{filteredSales.length}</strong>
        </div>

        <div>
          <span>Filtered Revenue</span>
          <strong>PKR {filteredRevenue.toLocaleString()}</strong>
        </div>
      </div>
      <div className="report-filters">
        <input
          type="text"
          placeholder="Search customer or product..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
        >
          <option value="All">All Payments</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />

        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            setPaymentFilter("All");
            setDateFilter("");
          }}
        >
          Clear Filters
        </button>
        <button type="button" className="export-button" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>
      <div className="sales-history-table">
        {filteredSales.length === 0 ? (
          <p className="no-sales">No sales found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.customer}</td>
                  <td>{sale.product}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>PKR {Number(sale.total).toLocaleString()}</td>
                  <td>{sale.date}</td>
                  <td>
                    <span className="completed-status">{sale.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SalesHistory;
