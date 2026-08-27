import "./SalesHistory.css";
import { useEffect, useState } from "react";
function SalesHistory() {
const [sales, setSales] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [paymentFilter, setPaymentFilter] = useState("All");
const [dateFilter, setDateFilter] = useState("");
useEffect(() => {
  const loadSales = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sales", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load sales.");
      }

      setSales(
        data.map((sale) => ({
          id: sale.Id,
          customer: sale.Customer,
          productId: sale.ProductId,
          product: sale.ProductName,
          quantity: Number(sale.Quantity),
          paymentMethod: sale.PaymentMethod,
          total: Number(sale.Total),
          date: new Date(sale.SaleDate).toLocaleString(),
          status: sale.Status,
        })),
      );
    } catch (error) {
      alert(error.message);
    }
  };

  loadSales();
}, []);
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
  (sum, sale) =>
    sale.status === "Returned" ? sum : sum + Number(sale.total || 0),
  0,
);
const completedFilteredSales = filteredSales.filter(
  (sale) => sale.status !== "Returned",
);

const averageOrderValue =
  completedFilteredSales.length > 0
    ? filteredRevenue / completedFilteredSales.length
    : 0;
const productQuantities = completedFilteredSales.reduce((totals, sale) => {
  const productName = sale.product || "Unknown Product";

  totals[productName] = (totals[productName] || 0) + Number(sale.quantity || 0);

  return totals;
}, {});

  const topProduct = Object.entries(productQuantities).sort(
    (first, second) => second[1] - first[1],
  )[0];

  const topSellingProduct = topProduct
    ? `${topProduct[0]} (${topProduct[1]} sold)`
    : "No sales";
const handleReturnSale = async (sale) => {
  if (sale.status === "Returned") {
    alert("This sale has already been returned.");
    return;
  }

  const confirmReturn = window.confirm(
    `Return ${sale.quantity} × ${sale.product}?`,
  );

  if (!confirmReturn) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/sales/${sale.id}/return`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to return sale.");
    }

    setSales(
      sales.map((item) =>
        item.id === sale.id ? { ...item, status: "Returned" } : item,
      ),
    );
  } catch (error) {
    alert(error.message);
  }
};
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
        <div>
          <span>Average Order Value</span>
          <strong>
            PKR{" "}
            {averageOrderValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>
        <div>
          <span>Top Selling Product</span>
          <strong>{topSellingProduct}</strong>
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
                <th>Action</th>
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
                    <span
                      className={
                        sale.status === "Returned"
                          ? "returned-status"
                          : "completed-status"
                      }
                    >
                      {sale.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="return-sale-button"
                      onClick={() => handleReturnSale(sale)}
                      disabled={sale.status === "Returned"}
                    >
                      {sale.status === "Returned" ? "Returned" : "Return"}
                    </button>
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
