import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const salesData = [
  { day: "Mon", sales: 32000 },
  { day: "Tue", sales: 45000 },
  { day: "Wed", sales: 38000 },
  { day: "Thu", sales: 52000 },
  { day: "Fri", sales: 61000 },
  { day: "Sat", sales: 72000 },
  { day: "Sun", sales: 48500 },
];
function App() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Smart POS</h2>

        <nav>
          <button className="active">Dashboard</button>
          <button>Products</button>
          <button>Sales</button>
          <button>Inventory</button>
          <button>Employees</button>
          <button>Reports</button>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Kashif!</p>
          </div>

          <button className="new-sale">+ New Sale</button>
        </header>

        <section className="cards">
          <div className="card">
            <p>Today's Sales</p>
            <h2>PKR 48,500</h2>
            <span>12% increase</span>
          </div>

          <div className="card">
            <p>Monthly Sales</p>
            <h2>PKR 425,000</h2>
            <span>8% increase</span>
          </div>

          <div className="card">
            <p>Total Orders</p>
            <h2>132</h2>
            <span>24 today</span>
          </div>

          <div className="card">
            <p>Total Products</p>
            <h2>286</h2>
            <span>8 low in stock</span>
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
            <button>View All</button>
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
              <tr>
                <td>#1001</td>
                <td>Ali Khan</td>
                <td>3 Items</td>
                <td>Cash</td>
                <td>PKR 3,500</td>
                <td>
                  <span className="status">Completed</span>
                </td>
              </tr>

              <tr>
                <td>#1002</td>
                <td>Ahmed Raza</td>
                <td>2 Items</td>
                <td>Card</td>
                <td>PKR 2,800</td>
                <td>
                  <span className="status">Completed</span>
                </td>
              </tr>

              <tr>
                <td>#1003</td>
                <td>Sara Ali</td>
                <td>5 Items</td>
                <td>Cash</td>
                <td>PKR 6,200</td>
                <td>
                  <span className="status">Completed</span>
                </td>
              </tr>
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
      </main>
    </div>
  );
}

export default App;
