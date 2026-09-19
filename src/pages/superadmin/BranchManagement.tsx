import React, { useState } from 'react';
import { DataService } from '../../services/storage';
import { Branch } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import {
  Plus,
  Edit2,
  Lock,
  Eye,
  Power,
  PowerOff,
  Store,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export interface BranchManagementProps {
  onSwitchToBranchView?: (branchId: string) => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({ onSwitchToBranchView }) => {
  const [branches, setBranches] = useState<Branch[]>(DataService.getBranches());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    username: '',
    password: '',
    address: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
    crNumber: '',
    vatNumber: '310234567800003',
    managerName: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [branchToToggle, setBranchToToggle] = useState<Branch | null>(null);

  const toast = useToast();

  const refreshBranches = () => {
    setBranches(DataService.getBranches());
  };

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.arabicName.includes(searchQuery) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      arabicName: '',
      username: '',
      password: '',
      address: '',
      phone: '',
      status: 'active',
      crNumber: '1010' + Math.floor(100000 + Math.random() * 900000),
      vatNumber: '310234567800003',
      managerName: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error('Branch name, username and password are required.');
      return;
    }

    // Check if username already exists
    const existingUsers = DataService.getBranches().map((b) => b.username.toLowerCase());
    if (existingUsers.includes(formData.username.toLowerCase())) {
      toast.error('This username is already taken by another branch.');
      return;
    }

    DataService.createBranch({
      name: formData.name,
      arabicName: formData.arabicName || formData.name,
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      address: formData.address || 'Saudi Arabia',
      phone: formData.phone || '+966 11 000 0000',
      status: formData.status,
      crNumber: formData.crNumber,
      vatNumber: formData.vatNumber,
      managerName: formData.managerName,
    });

    toast.success(`Branch "${formData.name}" created successfully!`, 'Branch Created');
    setIsCreateOpen(false);
    refreshBranches();
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      arabicName: branch.arabicName,
      username: branch.username,
      password: branch.password || '',
      address: branch.address,
      phone: branch.phone,
      status: branch.status,
      crNumber: branch.crNumber,
      vatNumber: branch.vatNumber,
      managerName: branch.managerName || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    DataService.updateBranch(selectedBranch.id, {
      name: formData.name,
      arabicName: formData.arabicName,
      address: formData.address,
      phone: formData.phone,
      status: formData.status,
      crNumber: formData.crNumber,
      vatNumber: formData.vatNumber,
      managerName: formData.managerName,
    });

    toast.success(`Branch "${formData.name}" updated successfully.`);
    setIsEditOpen(false);
    refreshBranches();
  };

  const handleToggleStatus = (branch: Branch) => {
    setBranchToToggle(branch);
    setShowStatusConfirm(true);
  };

  const confirmToggleStatus = () => {
    if (!branchToToggle) return;
    const newStatus = branchToToggle.status === 'active' ? 'inactive' : 'active';
    DataService.updateBranch(branchToToggle.id, { status: newStatus });
    toast.success(`Branch "${branchToToggle.name}" status changed to ${newStatus}.`);
    setShowStatusConfirm(false);
    setBranchToToggle(null);
    refreshBranches();
  };

  const handleOpenPasswordReset = (branch: Branch) => {
    setSelectedBranch(branch);
    setNewPassword('');
    setIsPasswordResetOpen(true);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }

    DataService.updateBranch(selectedBranch.id, { password: newPassword });
    toast.success(`Password for ${selectedBranch.name} reset successfully!`);
    setIsPasswordResetOpen(false);
    refreshBranches();
  };

  const handleOpenDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search branch name, user, phone, address..."
          />

          <div className="w-40">
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            />
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create New Branch
        </Button>
      </div>

      {/* Branches Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Branch & Location</TableHeaderCell>
            <TableHeaderCell>Login Username</TableHeaderCell>
            <TableHeaderCell>Contact Phone</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Created Date</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredBranches.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-xs font-urdu text-slate-500">{b.arabicName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-xs">{b.address}</span>
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                  {b.username}
                </span>
              </TableCell>

              <TableCell>
                <div className="text-xs text-slate-700 font-medium">{b.phone}</div>
              </TableCell>

              <TableCell>
                <Badge variant={b.status === 'active' ? 'success' : 'danger'}>
                  {b.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-500">{formatDate(b.createdAt)}</span>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {onSwitchToBranchView && (
                    <button
                      onClick={() => onSwitchToBranchView(b.id)}
                      className="px-2 py-1 text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-sky-200"
                      title="Open Branch POS Portal / برانچ پورٹل کھولیں"
                    >
                      <Store className="w-3.5 h-3.5 text-sky-600" />
                      <span>Open POS</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDetails(b)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="View Branch Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Edit Branch"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenPasswordReset(b)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                    title="Reset Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      b.status === 'active'
                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={b.status === 'active' ? 'Deactivate Branch' : 'Activate Branch'}
                  >
                    {b.status === 'active' ? (
                      <PowerOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Power className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredBranches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                No branches found matching your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* CREATE BRANCH MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Restaurant Branch"
        subtitle="Provision a new branch with isolated storage and dedicated login credentials"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch Name (English)"
              placeholder="e.g. Riyadh Al Nakheel Branch"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Branch Name / برانچ کا نام (اردو)"
              placeholder="مثال: ریاض النخیل برانچ"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username (For Branch Login)"
              placeholder="e.g. nakheel"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              label="Initial Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+966 11 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Branch Manager Name"
              placeholder="Manager name"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            />
          </div>

          <Input
            label="Full Physical Address"
            placeholder="Street address, District, City, Postal Code"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Commercial Reg (CR Number)"
              placeholder="1010XXXXXX"
              value={formData.crNumber}
              onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
            />
            <Input
              label="VAT Registration Number (15 digits)"
              placeholder="310XXXXXXXXXXXX"
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Branch
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT BRANCH MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Branch Information"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch Name (English)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Branch Name / برانچ کا نام (اردو)"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Branch Manager"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            />
          </div>

          <Input
            label="Full Physical Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CR Number"
              value={formData.crNumber}
              onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
            />
            <Input
              label="VAT Registration Number"
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
        title={`Reset Password: ${selectedBranch?.name}`}
        size="sm"
      >
        <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter a new password for branch user <strong className="font-mono text-slate-900">{selectedBranch?.username}</strong>.
          </p>

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsPasswordResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {selectedBranch && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={selectedBranch.name}
          subtitle={selectedBranch.arabicName}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Branch Status:</span>
                <Badge variant={selectedBranch.status === 'active' ? 'success' : 'danger'}>
                  {selectedBranch.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login Username:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBranch.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manager:</span>
                <span className="font-semibold text-slate-900">{selectedBranch.managerName || 'Assigned Branch Lead'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-900">{selectedBranch.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created Date:</span>
                <span className="text-slate-900">{formatDate(selectedBranch.createdAt)}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-900 uppercase text-[11px] mb-1">ZATCA & Commercial Info</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT Registration:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBranch.vatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial Reg (CR):</span>
                <span className="font-mono text-slate-900">{selectedBranch.crNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-slate-900 text-right max-w-xs">{selectedBranch.address}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM STATUS TOGGLE */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={confirmToggleStatus}
        title={branchToToggle?.status === 'active' ? 'Deactivate Branch?' : 'Activate Branch?'}
        message={`Are you sure you want to ${
          branchToToggle?.status === 'active' ? 'deactivate' : 'activate'
        } "${branchToToggle?.name}"? ${
          branchToToggle?.status === 'active'
            ? 'Branch users will not be able to log in while deactivated.'
            : 'Branch users will be granted access immediately.'
        }`}
        variant={branchToToggle?.status === 'active' ? 'danger' : 'primary'}
        confirmText={branchToToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
      />
    </div>
  );
};
