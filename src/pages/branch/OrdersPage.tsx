import React, { useState, useMemo } from 'react';
import { User, Order } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { ThermalReceiptModal } from '../../components/receipt/ThermalReceiptModal';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import { formatSAR, formatDate } from '../../utils/formatters';
import {
  Printer,
  Eye,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Filter,
} from 'lucide-react';

export interface OrdersPageProps {
  currentUser: User;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const branchSettings = DataService.getBranchSettings(branchId);
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>(() => DataService.getOrders(branchId));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled' | 'refunded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);

  const refreshOrders = () => {
    setOrders(DataService.getOrders(branchId));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        (order.orderNumber || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.cashierName && order.cashierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchType = typeFilter === 'all' || order.orderType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, searchQuery, statusFilter, typeFilter]);

  const handleOpenReceipt = (order: Order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleOpenRefund = (order: Order) => {
    setOrderToRefund(order);
    setShowRefundConfirm(true);
  };

  const handleConfirmRefund = () => {
    if (!orderToRefund) return;
    DataService.updateOrderStatus(orderToRefund.id, 'refunded');
    toast.success(`Order #${orderToRefund.orderNumber} status changed to Refunded.`);
    setShowRefundConfirm(false);
    setOrderToRefund(null);
    refreshOrders();
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order #, customer, item..."
            className="w-64"
          />

          <div className="w-36">
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            />
          </div>

          <div className="w-36">
            <Select
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'dine_in', label: 'Dine-In' },
                { value: 'takeaway', label: 'Takeaway' },
                { value: 'delivery', label: 'Delivery' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            />
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <strong className="text-slate-900">{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* Orders Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Order #</TableHeaderCell>
            <TableHeaderCell>Date & Time</TableHeaderCell>
            <TableHeaderCell>Type / Table</TableHeaderCell>
            <TableHeaderCell>Items Summary</TableHeaderCell>
            <TableHeaderCell>Cashier</TableHeaderCell>
            <TableHeaderCell>Payment</TableHeaderCell>
            <TableHeaderCell className="text-right">Grand Total</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {order.orderNumber}
                </span>
              </TableCell>

              <TableCell>
                <div className="text-xs font-medium text-slate-900">{order.date}</div>
                <div className="text-[10px] text-slate-400 font-mono">{order.time}</div>
              </TableCell>

              <TableCell>
                <Badge variant="default" size="sm" className="uppercase font-bold">
                  {order.orderType} {order.tableNumber ? `• ${order.tableNumber}` : ''}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-xs text-slate-700 max-w-xs truncate">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-600">{order.cashierName}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {order.paymentMethod}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <span className="text-xs font-bold text-emerald-700">{formatSAR(order.grandTotal)}</span>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    order.status === 'completed'
                      ? 'success'
                      : order.status === 'refunded'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {order.status}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenDetails(order)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                    title="View Full Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenReceipt(order)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md cursor-pointer"
                    title="Reprint Thermal Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {order.status === 'completed' && (
                    <button
                      onClick={() => handleOpenRefund(order)}
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-md cursor-pointer"
                      title="Issue Refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                No orders found matching filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Order #${selectedOrder.orderNumber}`}
          subtitle={`${selectedOrder.date} ${selectedOrder.time} • ${selectedOrder.orderType.toUpperCase()}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span className="font-semibold text-slate-900">{selectedOrder.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold uppercase text-slate-900">{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span>{selectedOrder.customerName}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((i) => (
                    <tr key={i.id}>
                      <td className="p-2">
                        <div className="font-bold text-slate-900">{i.name}</div>
                        {i.arabicName && <div className="text-[10px] text-slate-500 font-urdu">{i.arabicName}</div>}
                        {i.notes && <div className="text-[10px] text-amber-700 italic">* {i.notes}</div>}
                      </td>
                      <td className="p-2 text-center font-bold">{i.quantity}</td>
                      <td className="p-2 text-right">{i.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">{i.totalPrice.toFixed(2)} SAR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{selectedOrder.subtotal.toFixed(2)} SAR</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">-{selectedOrder.discountAmount.toFixed(2)} SAR</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT ({selectedOrder.taxRate}%):</span>
                <span className="font-mono font-medium">{selectedOrder.taxAmount.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base text-[#ea6918] font-mono font-bold">{selectedOrder.grandTotal.toFixed(2)} SAR</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsReceiptOpen(true);
                }}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* THERMAL RECEIPT MODAL */}
      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={selectedOrder}
        branchSettings={branchSettings}
      />

      {/* CONFIRM REFUND */}
      <ConfirmDialog
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        onConfirm={handleConfirmRefund}
        title="Refund Order?"
        message={`Are you sure you want to mark Order #${orderToRefund?.orderNumber} (${formatSAR(orderToRefund?.grandTotal || 0)}) as Refunded?`}
        variant="warning"
        confirmText="Confirm Refund"
      />
    </div>
  );
};
