import { Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Modal from "../components/Modal.jsx";
import { ErrorState, Loading } from "../components/State.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { getErrorMessage, productsApi } from "../services/api.js";

const blank = { product_name: "", sku: "", price: "", quantity_in_stock: "" };

export default function Products() {
  const { data = [], loading, error, reload } = useAsync(productsApi.list, []);
  const [editing, setEditing] = useState(null);
  const { notify } = useToast();
  async function remove(id) {
    await productsApi.remove(id);
    notify("Product deleted");
    reload();
  }
  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} />;
  return (
    <section>
      <div className="page-title"><h2>Products</h2><button onClick={() => setEditing(blank)}><Plus size={18} />Add Product</button></div>
      <div className="panel"><table><thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>
        {data.map((p) => <tr key={p.id}><td>{p.product_name}</td><td>{p.sku}</td><td>${p.price}</td><td>{p.quantity_in_stock}</td><td className="actions"><button className="icon-button" onClick={() => setEditing(p)}><Pencil size={16} /></button><button className="icon-button danger" onClick={() => remove(p.id)}><Trash2 size={16} /></button></td></tr>)}
      </tbody></table></div>
      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); notify("Product saved"); reload(); }} />}
    </section>
  );
}

function ProductForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial.id);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { product_name: form.product_name, sku: form.sku, price: Number(form.price), quantity_in_stock: Number(form.quantity_in_stock) };
      isEdit ? await productsApi.update(initial.id, payload) : await productsApi.create(payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return <Modal title={isEdit ? "Edit Product" : "Add Product"} onClose={onClose}><form onSubmit={submit} className="form">
    {error && <p className="inline-error">{error}</p>}
    <label>Name<input name="product_name" value={form.product_name} onChange={update} required /></label>
    <label>SKU<input name="sku" value={form.sku} onChange={update} required /></label>
    <label>Price<input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={update} required /></label>
    <label>Stock<input name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={update} required /></label>
    <button type="submit">Save</button>
  </form></Modal>;
}
