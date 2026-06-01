import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Modal from "../components/Modal.jsx";
import { ErrorState, Loading } from "../components/State.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { customersApi, getErrorMessage } from "../services/api.js";

export default function Customers() {
  const { data = [], loading, error, reload } = useAsync(customersApi.list, []);
  const [open, setOpen] = useState(false);
  const { notify } = useToast();
  async function remove(id) {
    await customersApi.remove(id);
    notify("Customer deleted");
    reload();
  }
  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} />;
  return <section><div className="page-title"><h2>Customers</h2><button onClick={() => setOpen(true)}><Plus size={18} />Add Customer</button></div>
    <div className="panel"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>
      {data.map((c) => <tr key={c.id}><td>{c.full_name}</td><td>{c.email}</td><td>{c.phone_number}</td><td className="actions"><button className="icon-button danger" onClick={() => remove(c.id)}><Trash2 size={16} /></button></td></tr>)}
    </tbody></table></div>
    {open && <CustomerForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); notify("Customer saved"); reload(); }} />}
  </section>;
}

function CustomerForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone_number: "" });
  const [error, setError] = useState("");
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    try {
      await customersApi.create(form);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return <Modal title="Add Customer" onClose={onClose}><form onSubmit={submit} className="form">
    {error && <p className="inline-error">{error}</p>}
    <label>Name<input name="full_name" value={form.full_name} onChange={update} required /></label>
    <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
    <label>Phone<input name="phone_number" value={form.phone_number} onChange={update} /></label>
    <button type="submit">Save</button>
  </form></Modal>;
}
