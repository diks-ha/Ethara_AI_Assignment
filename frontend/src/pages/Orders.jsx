import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Modal from "../components/Modal.jsx";
import { ErrorState, Loading } from "../components/State.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { customersApi, getErrorMessage, ordersApi, productsApi } from "../services/api.js";

export default function Orders() {
  const orders = useAsync(ordersApi.list, []);
  const products = useAsync(productsApi.list, []);
  const customers = useAsync(customersApi.list, []);
  const [open, setOpen] = useState(false);
  const { notify } = useToast();
  if (orders.loading || products.loading || customers.loading) return <Loading />;
  if (orders.error) return <ErrorState message={getErrorMessage(orders.error)} />;
  async function remove(id) {
    await ordersApi.remove(id);
    notify("Order deleted");
    orders.reload();
  }
  return <section><div className="page-title"><h2>Orders</h2><button onClick={() => setOpen(true)}><Plus size={18} />Create Order</button></div>
    <div className="panel"><table><thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Items</th><th></th></tr></thead><tbody>
      {orders.data.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.customer.full_name}</td><td>${o.total_amount}</td><td><span className="pill">{o.status}</span></td><td>{o.items.map((i) => `${i.product.product_name} x${i.quantity}`).join(", ")}</td><td className="actions"><button className="icon-button danger" onClick={() => remove(o.id)}><Trash2 size={16} /></button></td></tr>)}
    </tbody></table></div>
    {open && <OrderForm customers={customers.data} products={products.data} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); notify("Order created"); orders.reload(); products.reload(); }} />}
  </section>;
}

function OrderForm({ customers, products, onClose, onSaved }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [items, setItems] = useState([{ product_id: products[0]?.id || "", quantity: 1 }]);
  const [error, setError] = useState("");
  function setItem(index, key, value) {
    setItems(items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }
  async function submit(e) {
    e.preventDefault();
    try {
      await ordersApi.create({ customer_id: Number(customerId), products: items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })) });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return <Modal title="Create Order" onClose={onClose}><form onSubmit={submit} className="form">
    {error && <p className="inline-error">{error}</p>}
    <label>Customer<select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>{customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></label>
    {items.map((item, index) => <div className="row" key={index}>
      <label>Product<select value={item.product_id} onChange={(e) => setItem(index, "product_id", e.target.value)} required>{products.map((p) => <option key={p.id} value={p.id}>{p.product_name} ({p.quantity_in_stock})</option>)}</select></label>
      <label>Qty<input type="number" min="1" value={item.quantity} onChange={(e) => setItem(index, "quantity", e.target.value)} required /></label>
    </div>)}
    <button type="button" className="secondary" onClick={() => setItems([...items, { product_id: products[0]?.id || "", quantity: 1 }])}>Add Line</button>
    <button type="submit">Create</button>
  </form></Modal>;
}
