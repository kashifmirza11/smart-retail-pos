import "./App.css";
import { useState } from "react";
import Products from "./Products";
import Sales from "./Sales";
import SalesHistory from "./SalesHistory";
import Inventory from "./Inventory";
import Employees from "./Employees";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const savedProducts = JSON.parse(localStorage.getItem("products")) || [];

  const savedSales = JSON.parse(localStorage.getItem("sales")) || [];
const salesData = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));

  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
  });

  const sales = savedSales
    .filter((sale) => {
      const saleDate = new Date(
        sale.date || sale.createdAt || sale.saleDate || Date.now(),
      );

      return saleDate.toDateString() === date.toDateString();
    })
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  return { day, sales };
});
  const totalProducts = savedProducts.length;

  const totalSales = savedSales.length;

  const totalRevenue = savedSales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0,
  );

  const lowStockItems = savedProducts.filter(
    (product) => Number(product.stock) <= 5,
  ).length;
  const lowStockProducts = savedProducts.filter(
    (product) => Number(product.stock) <= 5,
  );
 const handleAddProduct = () => {
   if (
     newProduct.name.trim() === "" ||
     newProduct.price === "" ||
     newProduct.stock === ""
   ) {
     alert("Please fill all product fields.");
     return;
   }

   const productToAdd = {
     id: Date.now(),
     name: newProduct.name.trim(),
     category: newProduct.category,
     price: Number(newProduct.price),
     stock: Number(newProduct.stock),
   };

   setProducts([...products, productToAdd]);

   setNewProduct({
     name: "",
     category: "Drinks",
     price: "",
     stock: "",
   });

   setShowForm(false);
 };
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Smart POS</h2>

        <nav>
          <button
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={activePage === "products" ? "active" : ""}
            onClick={() => setActivePage("products")}
          >
            Products
          </button>
          <button
            className={activePage === "sales" ? "active" : ""}
            onClick={() => setActivePage("sales")}
          >
            Sales
          </button>
          <button
            className={activePage === "inventory" ? "active" : ""}
            onClick={() => setActivePage("inventory")}
          >
            Inventory
          </button>
          <button
            className={activePage === "employees" ? "active" : ""}
            onClick={() => setActivePage("employees")}
          >
            Employees
          </button>
          <button
            className={activePage === "reports" ? "active" : ""}
            onClick={() => setActivePage("reports")}
          >
            Reports
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {activePage === "products" ? (
          <Products />
        ) : activePage === "sales" ? (
          <Sales />
        ) : activePage === "inventory" ? (
          <Inventory />
        ) : activePage === "employees" ? (
          <Employees />
        ) : activePage === "reports" ? (
          <SalesHistory />
        ) : (
          <>
            <header>
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, Kashif!</p>
              </div>

              <button
                className="add-product-btn"
                onClick={() => setActivePage("sales")}
              >
                + New Sale
              </button>
            </header>
            {lowStockProducts.length > 0 && (
              <div className="low-stock-alert">
                <div>
                  <strong>⚠ Low Stock Alert</strong>
                  <p>
                    {lowStockProducts
                      .map(
                        (product) => `${product.name} (${product.stock} left)`,
                      )
                      .join(", ")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage("inventory")}
                >
                  View Inventory
                </button>
              </div>
            )}
            <section className="cards">
              <div className="card">
                <h3>Total Products</h3>
                <p>{totalProducts}</p>
                <span>Available store products</span>
              </div>

              <div className="card">
                <h3>Completed Sales</h3>
                <p>{totalSales}</p>
                <span>Total completed transactions</span>
              </div>

              <div className="card">
                <h3>Total Revenue</h3>
                <p>PKR {totalRevenue.toLocaleString()}</p>
                <span>Revenue from completed sales</span>
              </div>

              <div className="card">
                <h3>Low Stock Items</h3>
                <p>{lowStockItems}</p>
                <span>Products with stock 5 or less</span>
              </div>
            </section>
            <section className="sales-chart">
              <div className="section-heading">
                <div>
                  <h2>Weekly Sales</h2>
                  <p>Sales performance for the last 7 days</p>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`PKR ${value}`, "Sales"]} />
                    <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="recent-sales">
              <div className="section-heading">
                <h2>Recent Sales</h2>
                <button onClick={() => setActivePage("reports")}>
                  View All
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSales.length === 0 ? (
                    <tr>
                      <td colSpan="6">No sales found.</td>
                    </tr>
                  ) : (
                    savedSales
                      .slice(-5)
                      .reverse()
                      .map((sale, index) => (
                        <tr key={sale.id || index}>
                          <td>#{sale.id || savedSales.length - index}</td>

                          <td>
                            {sale.customerName ||
                              sale.customer ||
                              "Walk-in Customer"}
                          </td>

                          <td>
                            {sale.productName ||
                              sale.product ||
                              `${sale.quantity || 1} Item`}
                          </td>

                          <td>
                            {sale.paymentMethod || sale.payment || "Cash"}
                          </td>

                          <td>
                            PKR {Number(sale.total || 0).toLocaleString()}
                          </td>

                          <td>
                            <span className="status completed">Completed</span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </section>
            <section className="low-stock">
              <div className="section-heading">
                <h2>Low Stock Products</h2>
                <button>View Inventory</button>
              </div>

              <div className="stock-list">
                <div className="stock-item">
                  <div>
                    <h3>Coca Cola 500ml</h3>
                    <p>Drinks</p>
                  </div>
                  <span className="stock-warning">3 left</span>
                </div>

                <div className="stock-item">
                  <div>
                    <h3>Fresh Milk 1L</h3>
                    <p>Dairy</p>
                  </div>
                  <span className="stock-warning">5 left</span>
                </div>

                <div className="stock-item">
                  <div>
                    <h3>Brown Bread</h3>
                    <p>Bakery</p>
                  </div>
                  <span className="stock-warning">2 left</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
