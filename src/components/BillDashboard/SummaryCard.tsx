import { AccountInfo, BillingSummary } from "@/src/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, CreditCard, User, Phone, MapPin } from "lucide-react";

interface SummaryCardProps {
  account: AccountInfo;
  summary: BillingSummary;
  filename: string;
}

function fmt(val: string | null) {
  return val ?? "—";
}

function fmtAmount(val: number | null, currency = "PHP") {
  if (val === null) return "—";
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(val);
}

function fmtDate(val: string | null) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return val;
  }
}

export function SummaryCard({ account, summary, filename }: SummaryCardProps) {
  const period =
    summary.billingPeriodStart && summary.billingPeriodEnd
      ? `${fmtDate(summary.billingPeriodStart)} – ${fmtDate(summary.billingPeriodEnd)}`
      : "—";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <p className="text-xs font-medium uppercase tracking-wider opacity-75">Billing Statement</p>
        <CardTitle className="text-2xl">{fmt(account.accountName)}</CardTitle>
        <p className="text-sm opacity-90 truncate">{filename}</p>
      </CardHeader>

      <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
        {/* Total due — most prominent */}
        <div className="sm:col-span-2 rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Total Amount Due</p>
          <p className="mt-1 text-4xl font-bold text-blue-800">{fmtAmount(summary.totalDue, summary.currency)}</p>
          {summary.dueDate && (
            <p className="mt-1 text-sm text-blue-600">Due {fmtDate(summary.dueDate)}</p>
          )}
        </div>

        {/* Account info */}
        <div className="space-y-3">
          <Row icon={<CreditCard className="h-4 w-4" />} label="Account #" value={fmt(account.accountNumber)} />
          <Row icon={<Phone className="h-4 w-4" />} label="Service #" value={fmt(account.serviceNumber)} />
          <Row icon={<User className="h-4 w-4" />} label="Name" value={fmt(account.accountName)} />
          {account.address && (
            <Row icon={<MapPin className="h-4 w-4" />} label="Address" value={account.address} />
          )}
        </div>

        {/* Billing period */}
        <div className="space-y-3">
          <Row icon={<Calendar className="h-4 w-4" />} label="Billing Period" value={period} />
          {summary.previousBalance !== null && (
            <Row icon={null} label="Previous Balance" value={fmtAmount(summary.previousBalance, summary.currency)} />
          )}
          {summary.currentCharges !== null && (
            <Row icon={null} label="Current Charges" value={fmtAmount(summary.currentCharges, summary.currency)} />
          )}
          {summary.amountPaid !== null && (
            <Row icon={null} label="Amount Paid" value={fmtAmount(summary.amountPaid, summary.currency)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>}
      <span className="text-gray-500 shrink-0 w-28">{label}</span>
      <span className="font-medium text-gray-800 break-words">{value}</span>
    </div>
  );
}
