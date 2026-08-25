import { useEffect, useState } from "react";
const initialProducts = [
  {
    id: 1,
    name: "Coca Cola 500ml",
    category: "Drinks",
    price: 150,
    stock: 3,
  },
  {
    id: 2,
    name: "Fresh Milk 1L",
    category: "Dairy",
    price: 280,
    stock: 5,
  },
  {
    id: 3,
    name: "Brown Bread",
    category: "Bakery",
    price: 220,
    stock: 2,
  },
  {
    id: 4,
    name: "Basmati Rice 1kg",
    category: "Grocery",
    price: 450,
    stock: 18,
  },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Drinks",
    price: "",
    stock: "",
  });
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products.");
        }

        const formattedProducts = data.map((product) => ({
          id: product.Id,
          name: product.Name,
          category: product.Category,
          price: Number(product.Price),
          stock: Number(product.Stock),
        }));

        setProducts(formattedProducts);
      } catch (error) {
        alert(error.message);
      }
    };

    loadProducts();
  }, []);
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" || product.category === category;

    return matchesSearch && matchesCategory;
  });
  const handleRestock = (product) => {
    const amount = Number(
      prompt(`How many units do you want to add for ${product.name}?`),
    );

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }
const stockHistory = JSON.parse(localStorage.getItem("stockHistory")) || [];

const movement = {
  id: Date.now(),
  product: product.name,
  type: "Restock",
  quantity: amount,
  previousStock: Number(product.stock),
  newStock: Number(product.stock) + amount,
  date: new Date().toLocaleString(),
};

localStorage.setItem(
  "stockHistory",
  JSON.stringify([...stockHistory, movement]),
);
    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id
          ? {
              ...item,
              stock: Number(item.stock) + amount,
            }
          : item,
      ),
    );

    alert(`${amount} units added to ${product.name}.`);
  };
const handleAddProduct = async () => {
  if (
    newProduct.name.trim() === "" ||
    newProduct.price === "" ||
    newProduct.stock === ""
  ) {
    alert("Please fill all product fields.");
    return;
  }

  try {
    const productData = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
    };

    const isEditing = editingId !== null;

    const response = await fetch(
      isEditing
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products",
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(productData),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save product.");
    }

    const savedProduct = {
      id: data.Id,
      name: data.Name,
      category: data.Category,
      price: Number(data.Price),
      stock: Number(data.Stock),
    };

    setProducts((currentProducts) =>
      isEditing
        ? currentProducts.map((product) =>
            product.id === editingId ? savedProduct : product,
          )
        : [...currentProducts, savedProduct],
    );

    setEditingId(null);

    setNewProduct({
      name: "",
      category: "Drinks",
      price: "",
      stock: "",
    });

    setShowForm(false);
  } catch (error) {
    alert(error.message);
  }
};
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== productId),
      );
    } catch (error) {
      alert(error.message);
    }
  };
  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });

    setEditingId(product.id);
    setShowForm(true);
  };
  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your store products and stock</p>
        </div>

        <button className="add-product" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>
      {showForm && (
        <div className="product-form">
          <div className="form-heading">
            <h2>Add New Product</h2>

            <button
              type="button"
              className="close-form"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <div className="form-fields">
            <input
              type="text"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  name: event.target.value,
                })
              }
            />

            <select
              value={newProduct.category}
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  category: event.target.value,
                })
              }
            >
              <option>Drinks</option>
              <option>Dairy</option>
              <option>Bakery</option>
              <option>Grocery</option>
            </select>

            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  price: event.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(event) =>
                setNewProduct({
                  ...newProduct,
                  stock: event.target.value,
                })
              }
            />
          </div>

          <button
            type="button"
            className="save-product"
            onClick={handleAddProduct}
          >
            Save Product
          </button>
        </div>
      )}
      <div className="product-tools">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>All Categories</option>
          <option>Drinks</option>
          <option>Dairy</option>
          <option>Bakery</option>
          <option>Grocery</option>
        </select>
      </div>

      <div className="product-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>PKR {product.price}</td>
                <td>
                  <span
                    className={product.stock <= 5 ? "low-badge" : "stock-badge"}
                  >
                    {product.stock}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="restock-button"
                    onClick={() => handleRestock(product)}
                  >
                    Restock
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Products;
