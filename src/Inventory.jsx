import { useEffect, useState } from "react";
import "./Inventory.css";

function Inventory() {
const [products, setProducts] = useState([]);
const [stockHistory, setStockHistory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All Stock");
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const [productsResponse, historyResponse] = await Promise.all([
          fetch("http://localhost:5000/api/products", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/stock-history", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const productsData = await productsResponse.json();
        const historyData = await historyResponse.json();

        if (!productsResponse.ok) {
          throw new Error(productsData.message || "Unable to load products.");
        }

        if (!historyResponse.ok) {
          throw new Error(
            historyData.message || "Unable to load stock history.",
          );
        }

        setProducts(
          productsData.map((product) => ({
            id: product.Id,
            name: product.Name,
            category: product.Category,
            price: Number(product.Price),
            stock: Number(product.Stock),
          })),
        );

        setStockHistory(
          historyData.map((movement) => ({
            id: movement.Id,
            product: movement.ProductName,
            type: movement.MovementType,
            quantity: Math.abs(Number(movement.QuantityChange)),
            previousStock: Number(movement.PreviousStock),
            newStock: Number(movement.NewStock),
            date: new Date(movement.MovementDate).toLocaleString(),
          })),
        );
      } catch (error) {
        alert(error.message);
      }
    };

    loadInventory();
  }, []);
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock),
    0,
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5,
  ).length;
  const filteredProducts = products.filter((product) => {
    const searchText = inventorySearch.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText);

    const matchesStock =
      stockFilter === "All Stock" ||
      (stockFilter === "Low Stock" && Number(product.stock) <= 5) ||
      (stockFilter === "In Stock" && Number(product.stock) > 5);

    return matchesSearch && matchesStock;
  });
const handleClearHistory = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to clear stock movement history?",
  );

  if (!confirmed) return;

  try {
    const response = await fetch("http://localhost:5000/api/stock-history", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to clear stock history.");
    }

    setStockHistory([]);
  } catch (error) {
    alert(error.message);
  }
};
  const handleExportHistory = () => {
    if (stockHistory.length === 0) {
      alert("No stock movement history available.");
      return;
    }

    const headings = [
      "Product",
      "Type",
      "Quantity",
      "Previous Stock",
      "New Stock",
      "Date",
    ];

    const rows = stockHistory.map((movement) => [
      movement.product,
      movement.type,
      movement.type === "Sale Out"
        ? `-${movement.quantity}`
        : `+${movement.quantity}`,
      movement.previousStock,
      movement.newStock,
      movement.date,
    ]);

    const csvContent = [headings, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const file = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = "stock-movement-history.csv";
    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href);
  };
  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventory</h1>
        <p>Monitor product stock and availability.</p>
      </div>

      <div className="inventory-summary">
        <div className="inventory-card">
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div className="inventory-card">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="inventory-card warning-card">
          <span>Low Stock Items</span>
          <strong>{lowStockProducts}</strong>
        </div>
      </div>
      <div className="inventory-search">
        <input
          type="text"
          placeholder="Search product or category..."
          value={inventorySearch}
          onChange={(event) => setInventorySearch(event.target.value)}
        />
        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
        >
          <option value="All Stock">All Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="In Stock">In Stock</option>
        </select>
        {(inventorySearch || stockFilter !== "All Stock") && (
          <button
            type="button"
            onClick={() => {
              setInventorySearch("");
              setStockFilter("All Stock");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-inventory-results">
                  No matching products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>PKR {Number(product.price).toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      className={
                        Number(product.stock) <= 5
                          ? "inventory-status low-stock"
                          : "inventory-status in-stock"
                      }
                    >
                      {Number(product.stock) <= 5 ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="stock-history">
        <div className="stock-history-heading">
          <h2>Stock Movement History</h2>

          {stockHistory.length > 0 && (
            <div className="history-buttons">
              <button
                type="button"
                className="export-history-button"
                onClick={handleExportHistory}
              >
                Export CSV
              </button>

              <button
                type="button"
                className="clear-history-button"
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            </div>
          )}
        </div>

        {stockHistory.length === 0 ? (
          <p className="no-stock-history">No stock movements found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Added</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {[...stockHistory]
                .reverse()
                .slice(0, 10)
                .map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.product}</td>
                    <td>
                      <span
                        className={`movement-type ${movement.type === "Sale Out" ? "sale-out" : ""}`}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td>
                      {movement.type === "Sale Out" ? "-" : "+"}
                      {movement.quantity}
                    </td>
                    <td>{movement.previousStock}</td>
                    <td>{movement.newStock}</td>
                    <td>{movement.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Inventory;
