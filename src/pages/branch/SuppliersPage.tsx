import React, { useState, useMemo } from 'react';
import { User, Supplier } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2, Phone, Mail, Building, MapPin } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => DataService.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
  });

  const refreshSuppliers = () => {
    setSuppliers(DataService.getSuppliers());
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.arabicName && s.arabicName.includes(searchQuery)) ||
        (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.phone && s.phone.includes(searchQuery))
      );
    });
  }, [suppliers, searchQuery]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      arabicName: '',
      company: '',
      phone: '+966 11 ',
      email: '',
      address: 'Riyadh, Saudi Arabia',
      taxId: '300' + Math.floor(100000000000 + Math.random() * 900000000000) + '3',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      arabicName: s.arabicName || '',
      company: s.company || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      taxId: s.taxId || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Supplier name and phone are required.');
      return;
    }

    if (editingSupplier) {
      DataService.updateSupplier(editingSupplier.id, {
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        taxId: formData.taxId,
      });
      toast.success(`Supplier "${formData.name}" updated.`);
    } else {
      DataService.createSupplier({
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        taxId: formData.taxId,
      });
      toast.success(`Supplier "${formData.name}" added successfully.`);
    }

    setIsModalOpen(false);
    refreshSuppliers();
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search supplier, company, phone..."
          className="w-72"
        />

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Supplier Name</TableHeaderCell>
            <TableHeaderCell>Company</TableHeaderCell>
            <TableHeaderCell>Contact Phone</TableHeaderCell>
            <TableHeaderCell>VAT / Tax ID</TableHeaderCell>
            <TableHeaderCell>Address</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredSuppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-bold text-slate-900">{s.name}</div>
                <div className="text-xs font-urdu text-slate-500">{s.arabicName}</div>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-700 font-medium">{s.company || '-'}</span>
              </TableCell>

              <TableCell>
                <div className="text-xs text-slate-800 font-mono">{s.phone}</div>
                {s.email && <div className="text-[11px] text-slate-400">{s.email}</div>}
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs text-slate-600">{s.taxId || '-'}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-600 truncate max-w-xs block">{s.address || '-'}</span>
              </TableCell>

              <TableCell className="text-right">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                  title="Edit Supplier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        size="md"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Supplier / Contact Name"
              placeholder="e.g. Al-Marai Fresh Dairy"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Urdu Name / نام (اردو)"
              placeholder="مثال: المراعی ڈیری اینڈ پولٹری"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Legal Name"
              placeholder="e.g. Almarai Food Distribution"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="VAT / Tax Identification #"
              placeholder="300XXXXXXXXXXXX"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+966 11 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="sales@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Input
            label="Warehouse / Office Address"
            placeholder="Industrial Area, Riyadh"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
