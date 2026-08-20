import "./Inventory.css";

function Inventory() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
const stockHistory = JSON.parse(localStorage.getItem("stockHistory")) || [];
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock),
    0,
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5,
  ).length;

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
            {products.map((product) => (
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
            ))}
          </tbody>
        </table>
      </div>
      <div className="stock-history">
        <h2>Stock Movement History</h2>

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
                      <span className="movement-type">{movement.type}</span>
                    </td>
                    <td>+{movement.quantity}</td>
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
