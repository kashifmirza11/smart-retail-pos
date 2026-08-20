import "./Sales.css";
import { useState } from "react";

function Sales() {
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
const [receipt, setReceipt] = useState(null);
  const products = JSON.parse(localStorage.getItem("products")) || [];

  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId),
  );

  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleCompleteSale = () => {
    if (customerName.trim() === "") {
      alert("Please enter the customer name.");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    if (quantity < 1 || quantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} items are available.`);
      return;
    }

    const newSale = {
      id: Date.now(),
      customer: customerName.trim(),
      product: selectedProduct.name,
      quantity,
      paymentMethod,
      total: totalAmount,
      date: new Date().toLocaleString(),
      status: "Completed",
    };

    const previousSales = JSON.parse(localStorage.getItem("sales")) || [];

    localStorage.setItem("sales", JSON.stringify([...previousSales, newSale]));

    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id
        ? {
            ...product,
            stock: product.stock - quantity,
          }
        : product,
    );

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    const stockHistory = JSON.parse(localStorage.getItem("stockHistory")) || [];

    const saleMovement = {
      id: Date.now(),
      product: selectedProduct.name,
      type: "Sale Out",
      quantity: quantity,
      previousStock: Number(selectedProduct.stock),
      newStock: Number(selectedProduct.stock) - Number(quantity),
      date: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "stockHistory",
      JSON.stringify([...stockHistory, saleMovement]),
    );

 setReceipt(newSale);

    setCustomerName("");
    setSelectedProductId("");
    setQuantity(1);
    setPaymentMethod("Cash");
  };

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>New Sale</h1>
        <p>Create and manage customer sales.</p>
      </div>
      <div className="sale-form">
        <h2>Customer Details</h2>

        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />

        <select
          value={selectedProductId}
          onChange={(event) => setSelectedProductId(event.target.value)}
        >
          <option value="">Select a product</option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
              disabled={Number(product.stock) === 0}
            >
              {product.name} - PKR {product.price} -{" "}
              {Number(product.stock) === 0
                ? "Out of Stock"
                : `Stock: ${product.stock}`}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max={selectedProduct ? selectedProduct.stock : 1}
          placeholder="Quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />

        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        <div className="sale-total">
          <span>Total Amount</span>
          <strong>PKR {totalAmount.toLocaleString()}</strong>
        </div>

        <button
          type="button"
          className="complete-sale"
          onClick={handleCompleteSale}
        >
          Complete Sale
        </button>
      </div>
      {receipt && (
        <div className="receipt-overlay">
          <div className="receipt-modal">
            <h2>Smart POS</h2>
            <p className="receipt-title">SALE RECEIPT</p>

            <div className="receipt-details">
              <p>
                <strong>Order ID:</strong> {receipt.id}
              </p>
              <p>
                <strong>Customer:</strong> {receipt.customer}
              </p>
              <p>
                <strong>Product:</strong> {receipt.product}
              </p>
              <p>
                <strong>Quantity:</strong> {receipt.quantity}
              </p>
              <p>
                <strong>Payment:</strong> {receipt.paymentMethod}
              </p>
              <p>
                <strong>Date:</strong> {receipt.date}
              </p>
              <hr />
              <h3>Total: PKR {Number(receipt.total).toLocaleString()}</h3>
            </div>

            <div className="receipt-actions">
              <button onClick={() => window.print()}>Print Receipt</button>

              <button onClick={() => setReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}{" "}
    </div>
  );
}

export default Sales;
