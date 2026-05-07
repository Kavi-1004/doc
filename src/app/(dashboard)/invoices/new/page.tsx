"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface InvItem { description: string; quantity: number; unit: string; unitPrice: number; total: number; sortOrder: number; }
interface Company { id: string; name: string; shortCode: string; }
interface Customer { id: string; name: string; }
interface DO { id: string; doNumber: string; customerId: string; companyId: string; quotationId: string | null; quotation: { id: string; quotationNumber: string; items: { description: string; quantity: number; unit: string; unitPrice: number; }[]; } | null; }

export default function NewInvoicePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DO[]>([]);
  const [saving, setSaving] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [deliveryOrderId, setDeliveryOrderId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [footer, setFooter] = useState("");
  const [items, setItems] = useState<InvItem[]>([
    { description: "", quantity: 1, unit: "pcs", unitPrice: 0, total: 0, sortOrder: 0 },
  ]);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const grandTotal = subtotal - discount + taxAmount;

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/companies", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/customers", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/delivery-orders", { signal: controller.signal }).then((r) => r.json()),
    ])
      .then(([c, cu, d]) => {
        setCompanies(c);
        setCustomers(cu);
        setDeliveryOrders(d);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function selectDO(doId: string) {
    setDeliveryOrderId(doId);
    const d = deliveryOrders.find((d) => d.id === doId);
    if (d) {
      setCompanyId(d.companyId);
      setCustomerId(d.customerId);
      if (d.quotation?.items) {
        setItems(d.quotation.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          sortOrder: i,
        })));
      }
    }
  }

  function updateItem(index: number, field: keyof InvItem, value: string | number) {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    newItems[index] = item;
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit: "pcs", unitPrice: 0, total: 0, sortOrder: items.length }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!companyId || !customerId) { alert("Please select company and customer"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId, customerId,
          deliveryOrderId: deliveryOrderId || undefined,
          dueDate: dueDate || undefined,
          items, discount, taxRate, footer,
        }),
      });
      if (res.ok) router.push("/invoices");
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/invoices" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Delivery Order</label>
              <select value={deliveryOrderId} onChange={(e) => selectDO(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select (optional)</option>
                {deliveryOrders.map((d) => <option key={d.id} value={d.id}>{d.doNumber}</option>)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
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
                <div className="col-span-5"><input placeholder="Description" value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div className="col-span-2"><input type="number" placeholder="Qty" value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div className="col-span-1"><input placeholder="Unit" value={item.unit}
                  onChange={(e) => updateItem(i, "unit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div className="col-span-2"><input type="number" step="0.01" placeholder="Price" value={item.unitPrice}
                  onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div className="col-span-1 text-sm font-medium text-gray-700 pt-2 text-center">${item.total.toFixed(2)}</div>
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
          <h2 className="text-lg font-semibold mb-4">Totals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount ($)</label>
              <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-red-600">-${discount.toFixed(2)}</span></div>}
            {taxRate > 0 && <div className="flex justify-between"><span className="text-gray-600">Tax ({taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Grand Total:</span><span>${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
          <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
