import "./SalesHistory.css";

function SalesHistory() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];

  return (
    <div className="sales-history-page">
      <div className="sales-history-header">
        <h1>Sales History</h1>
        <p>View all completed customer sales.</p>
      </div>

      <div className="sales-history-table">
        {sales.length === 0 ? (
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
              {sales.map((sale) => (
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
