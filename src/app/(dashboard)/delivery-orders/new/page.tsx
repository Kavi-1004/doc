"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface DOItem {
  description: string;
  quantity: number;
  unit: string;
  sortOrder: number;
}

interface Company { id: string; name: string; shortCode: string; }
interface Customer { id: string; name: string; }
interface Quotation { id: string; quotationNumber: string; customerId: string; companyId: string; items: { description: string; quantity: number; unit: string; }[]; }

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [saving, setSaving] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [footer, setFooter] = useState("");
  const [items, setItems] = useState<DOItem[]>([
    { description: "", quantity: 1, unit: "pcs", sortOrder: 0 },
  ]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/companies", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/customers", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/quotations?status=APPROVED", { signal: controller.signal }).then((r) => r.json()),
    ])
      .then(([c, cu, q]) => {
        setCompanies(c);
        setCustomers(cu);
        setQuotations(q);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function selectQuotation(qId: string) {
    setQuotationId(qId);
    const q = quotations.find((q) => q.id === qId);
    if (q) {
      setCompanyId(q.companyId);
      setCustomerId(q.customerId);
      if (q.items) {
        setItems(q.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          sortOrder: i,
        })));
      }
    }
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit: "pcs", sortOrder: items.length }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!companyId || !customerId) {
      alert("Please select company and customer");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/delivery-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId, customerId, quotationId: quotationId || undefined,
          deliveryDate: deliveryDate || undefined, items, footer,
        }),
      });
      if (res.ok) router.push("/delivery-orders");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/delivery-orders" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Delivery Order</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Quotation</label>
              <select value={quotationId} onChange={(e) => selectQuotation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select (optional)</option>
                {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotationNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select required value={companyId} onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6">
                  <input placeholder="Description" value={item.description}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Qty" value={item.quantity}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], quantity: parseFloat(e.target.value) || 0 }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-3">
                  <input placeholder="Unit" value={item.unit}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], unit: e.target.value }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-1 flex items-center justify-center pt-1">
                  <button onClick={() => removeItem(i)} className="p-1.5 text-gray-400 hover:text-red-600" disabled={items.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
          <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create Delivery Order"}
        </button>
      </div>
    </div>
  );
}
