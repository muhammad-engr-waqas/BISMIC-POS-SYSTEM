import React, { useState, useMemo } from 'react';
import { User, StaffMember } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { useToast } from '../../components/common/Toast';
import { formatSAR, formatDate, getCurrentDate } from '../../utils/formatters';
import { Plus, Edit2, Users, Phone, ShieldCheck, UserCheck } from 'lucide-react';

export interface StaffPageProps {
  currentUser: User;
}

export const StaffPage: React.FC<StaffPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch-riyadh';
  const toast = useToast();

  const [staffList, setStaffList] = useState<StaffMember[]>(() => DataService.getStaff(branchId));
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    role: 'cashier',
    phone: '+966 5',
    email: '',
    nationalId: '',
    basicSalary: 4000,
    housingAllowance: 1000,
    transportAllowance: 500,
    status: 'active' as 'active' | 'on_leave' | 'terminated',
    joinDate: getCurrentDate(),
  });

  const refreshStaff = () => {
    setStaffList(DataService.getStaff(branchId));
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.arabicName && s.arabicName.includes(searchQuery)) ||
        (s.role && s.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.phone && s.phone.includes(searchQuery));

      const matchRole = roleFilter === 'all' || s.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [staffList, searchQuery, roleFilter]);

  const activeStaffCount = staffList.filter((s) => s.status === 'active').length;
  const totalMonthlyCommitment = staffList
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.basicSalary || s.salary || 0) + (s.housingAllowance || s.allowance || 0) + (s.transportAllowance || 0), 0);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      arabicName: '',
      role: 'cashier',
      phone: '+966 5',
      email: '',
      nationalId: '2' + Math.floor(100000000 + Math.random() * 900000000),
      basicSalary: 4000,
      housingAllowance: 1000,
      transportAllowance: 500,
      status: 'active',
      joinDate: getCurrentDate(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    const validStatus = s.status === 'terminated' || s.status === 'on_leave' ? s.status : 'active';
    setFormData({
      name: s.name,
      arabicName: s.arabicName || '',
      role: s.role || 'cashier',
      phone: s.phone || '',
      email: s.email || '',
      nationalId: s.nationalId || '',
      basicSalary: s.basicSalary || s.salary || 0,
      housingAllowance: s.housingAllowance || s.allowance || 0,
      transportAllowance: s.transportAllowance || 0,
      status: validStatus,
      joinDate: s.joinDate || getCurrentDate(),
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Staff name and phone are required.');
      return;
    }

    if (editingStaff) {
      DataService.updateStaff(editingStaff.id, {
        name: formData.name,
        arabicName: formData.arabicName,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        nationalId: formData.nationalId,
        basicSalary: Number(formData.basicSalary),
        housingAllowance: Number(formData.housingAllowance),
        transportAllowance: Number(formData.transportAllowance),
        status: formData.status,
        joinDate: formData.joinDate,
      });
      toast.success(`Staff member "${formData.name}" updated successfully.`);
    } else {
      DataService.createStaff({
        branchId,
        name: formData.name,
        arabicName: formData.arabicName,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        nationalId: formData.nationalId,
        basicSalary: Number(formData.basicSalary),
        housingAllowance: Number(formData.housingAllowance),
        transportAllowance: Number(formData.transportAllowance),
        status: formData.status,
        joinDate: formData.joinDate,
      });
      toast.success(`New staff member "${formData.name}" registered.`);
    }

    setIsModalOpen(false);
    refreshStaff();
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Headcount
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeStaffCount} Employees</div>
          <span className="text-xs text-slate-400">Total registered: {staffList.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Monthly Payroll Commitment
          </span>
          <div className="text-xl font-bold text-purple-700 mt-1">
            {formatSAR(totalMonthlyCommitment)}
          </div>
          <span className="text-xs text-slate-400">Basic + Housing + Transport</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Labor Compliance
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">Saudi Wage System (WPS)</div>
          <span className="text-xs text-slate-400">ZATCA & GOSI standard record format</span>
        </div>
      </div>

      {/* Action and Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput
              placeholder="Search employee name, role, phone..."
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
            />
          </div>

          <div className="w-44">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'manager', label: 'Manager' },
                { value: 'cashier', label: 'Cashier / POS' },
                { value: 'chef', label: 'Head Chef' },
                { value: 'waiter', label: 'Waiter / Server' },
                { value: 'barista', label: 'Barista' },
              ]}
            />
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Register Employee
        </Button>
      </div>

      {/* Staff Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Employee</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Contact & ID</TableHeaderCell>
            <TableHeaderCell>Join Date</TableHeaderCell>
            <TableHeaderCell className="text-right">Basic Salary</TableHeaderCell>
            <TableHeaderCell className="text-right">Allowances</TableHeaderCell>
            <TableHeaderCell className="text-right">Total Package</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredStaff.map((s) => {
            const basic = s.basicSalary || s.salary || 0;
            const housing = s.housingAllowance || s.allowance || 0;
            const transport = s.transportAllowance || 0;
            const total = basic + housing + transport;
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-bold text-slate-900">{s.name}</div>
                  {s.arabicName && <div className="text-xs text-slate-500 font-urdu">{s.arabicName}</div>}
                </TableCell>

                <TableCell>
                  <Badge variant="default" size="sm">
                    {s.role}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-xs text-slate-800 font-medium">{s.phone}</div>
                  {s.nationalId && <div className="text-[11px] font-mono text-slate-400">ID: {s.nationalId}</div>}
                </TableCell>

                <TableCell className="text-xs text-slate-500">{formatDate(s.joinDate)}</TableCell>

                <TableCell className="text-right font-medium text-slate-800">
                  {formatSAR(basic)}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-600">
                  {formatSAR(housing + transport)}
                </TableCell>

                <TableCell className="text-right font-bold text-purple-700">
                  {formatSAR(total)}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      s.status === 'active'
                        ? 'success'
                        : s.status === 'on_leave'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {s.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* STAFF CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? `Edit Employee: ${editingStaff.name}` : 'Register New Employee'}
        size="lg"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name (English) *"
              placeholder="e.g. Tariq Mansour"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Urdu Name / نام (اردو)"
              placeholder="مثال: طارق منصور / محمد رضوان"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />

            <Select
              label="Role / عہدہ یا پوسٹ"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'cashier', label: 'Cashier / POS Operator (کیشئر)' },
                { value: 'manager', label: 'Branch Manager (برانچ مینیجر)' },
                { value: 'chef', label: 'Head Chef (ہیڈ شیف)' },
                { value: 'cook', label: 'Kitchen Cook (باورچی / کک)' },
                { value: 'waiter', label: 'Waiter / Server (ویٹر)' },
                { value: 'barista', label: 'Barista (باریستا)' },
                { value: 'cleaner', label: 'Steward / Cleaner (صفائی عملہ)' },
              ]}
            />

            <Select
              label="Employment Status / ملازمتی کیفیت"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active / ڈیوٹی پر حاضر' },
                { value: 'on_leave', label: 'On Leave / چھٹی پر' },
                { value: 'terminated', label: 'Terminated / فارغ شدہ' },
              ]}
            />

            <Input
              label="Phone Number *"
              placeholder="+966 5X XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Saudi National ID / Iqama Number"
              placeholder="10-digit national/resident ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="staff@restaurant.sa"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Joining Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Salary & Allowance Structure (WPS Standard)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Basic Salary (SAR) *"
                type="number"
                min="0"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                required
              />

              <Input
                label="Housing Allowance (SAR)"
                type="number"
                min="0"
                value={formData.housingAllowance}
                onChange={(e) => setFormData({ ...formData, housingAllowance: Number(e.target.value) })}
              />

              <Input
                label="Transport Allowance (SAR)"
                type="number"
                min="0"
                value={formData.transportAllowance}
                onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-900">Total Monthly Guaranteed Package:</span>
              <span className="text-base font-bold text-purple-950 font-mono">
                {formatSAR(
                  Number(formData.basicSalary) +
                    Number(formData.housingAllowance) +
                    Number(formData.transportAllowance)
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingStaff ? 'Save Changes' : 'Register Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
