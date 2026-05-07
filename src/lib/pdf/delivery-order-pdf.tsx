import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#111827" },
  companyDetail: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  docTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#059669", textAlign: "right", textTransform: "uppercase" },
  docNumber: { fontSize: 8, color: "#6b7280", fontFamily: "Courier", marginTop: 4, textAlign: "right" },
  docDate: { fontSize: 9, color: "#6b7280", marginTop: 4, textAlign: "right" },
  section: { marginBottom: 15 },
  sectionLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  customerName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827" },
  customerDetail: { fontSize: 9, color: "#6b7280", marginTop: 1 },
  refRow: { flexDirection: "row", marginBottom: 4 },
  refLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6b7280", width: 100 },
  refValue: { fontSize: 9, color: "#111827", fontFamily: "Courier" },
  table: { marginBottom: 15 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tableHeaderCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: "#f3f4f6" },
  tableCell: { fontSize: 9, color: "#111827" },
  colNum: { width: "8%" },
  colDesc: { width: "52%" },
  colQty: { width: "20%", textAlign: "right" },
  colUnit: { width: "20%", textAlign: "center" },
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40, paddingTop: 15 },
  signatureBox: { width: "40%", borderTopWidth: 1, borderTopColor: "#d1d5db", paddingTop: 8 },
  signatureLabel: { fontSize: 9, color: "#6b7280", textAlign: "center" },
  footer: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10, marginTop: 15 },
  footerText: { fontSize: 9, color: "#6b7280" },
  generatedNote: { textAlign: "center", fontSize: 7, color: "#d1d5db", marginTop: 20 },
});

interface DOItem {
  description: string;
  quantity: number;
  unit: string;
}

interface Company {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Customer {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface DeliveryOrderPDFData {
  doNumber: string;
  deliveryDate?: string | null;
  company: Company;
  customer: Customer;
  items: DOItem[];
  quotationNumber?: string | null;
  poNumber?: string | null;
  footer?: string | null;
}

export function DeliveryOrderPDF({ data }: { data: DeliveryOrderPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.company.name}</Text>
            {data.company.address && <Text style={styles.companyDetail}>{data.company.address}</Text>}
            {data.company.phone && <Text style={styles.companyDetail}>Tel: {data.company.phone}</Text>}
            {data.company.email && <Text style={styles.companyDetail}>Email: {data.company.email}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>Delivery Order</Text>
            <Text style={styles.docNumber}>{data.doNumber}</Text>
            {data.deliveryDate && <Text style={styles.docDate}>Delivery Date: {data.deliveryDate}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deliver To</Text>
          <Text style={styles.customerName}>{data.customer.name}</Text>
          {data.customer.contactPerson && <Text style={styles.customerDetail}>Attn: {data.customer.contactPerson}</Text>}
          {data.customer.address && <Text style={styles.customerDetail}>{data.customer.address}</Text>}
          {data.customer.phone && <Text style={styles.customerDetail}>Tel: {data.customer.phone}</Text>}
        </View>

        <View style={styles.section}>
          {data.quotationNumber && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>Quotation Ref:</Text>
              <Text style={styles.refValue}>{data.quotationNumber}</Text>
            </View>
          )}
          {data.poNumber && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>PO Ref:</Text>
              <Text style={styles.refValue}>{data.poNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNum]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description || "-"}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Delivered By</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Received By</Text>
          </View>
        </View>

        {data.footer && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{data.footer}</Text>
          </View>
        )}

        <Text style={styles.generatedNote}>This is a computer-generated document. No signature is required.</Text>
      </Page>
    </Document>
  );
}
