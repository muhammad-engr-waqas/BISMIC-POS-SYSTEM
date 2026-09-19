import React, { useState, useMemo, useRef } from 'react';
import { User, MenuItem } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import { formatSAR } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  LayoutGrid,
  List,
  Upload,
  Link,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export interface MenuManagementPageProps {
  currentUser: User;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const toast = useToast();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => DataService.getMenuItems(branchId));
  const categories = useMemo(() => DataService.getCategories(branchId), [branchId]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    category: 'Shawarma & Sandwiches',
    price: 0,
    costPrice: 0,
    image: '',
    description: '',
    isAvailable: true,
  });

  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, image: base64String }));
      toast.success('Dish photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const refreshMenu = () => {
    setMenuItems(DataService.getMenuItems(branchId));
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory || item.categoryId === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.arabicName && item.arabicName.includes(searchQuery)) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setImageInputMode('upload');
    setFormData({
      name: '',
      arabicName: '',
      category: categories[0]?.name || 'Shawarma & Sandwiches',
      price: 25,
      costPrice: 10,
      image: '',
      description: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setImageInputMode(item.image && item.image.startsWith('http') ? 'url' : 'upload');
    setFormData({
      name: item.name,
      arabicName: item.arabicName || '',
      category: item.category || 'General',
      price: item.price,
      costPrice: item.costPrice || 0,
      image: item.image || '',
      description: item.description || '',
      isAvailable: item.isAvailable ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Item name and price are required.');
      return;
    }

    if (editingItem) {
      DataService.updateMenuItem(editingItem.id, {
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        category: formData.category,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        image: formData.image,
        description: formData.description,
        isAvailable: formData.isAvailable,
      });
      toast.success(`"${formData.name}" updated successfully.`);
    } else {
      DataService.createMenuItem({
        branchId,
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        category: formData.category,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        description: formData.description,
        isAvailable: formData.isAvailable,
      });
      toast.success(`"${formData.name}" added to menu.`);
    }

    setIsModalOpen(false);
    refreshMenu();
  };

  const handleToggleAvailability = (item: MenuItem) => {
    DataService.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    toast.info(`"${item.name}" is now ${!item.isAvailable ? 'Available' : 'Unavailable'}.`);
    refreshMenu();
  };

  const handleOpenDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    DataService.deleteMenuItem(itemToDelete.id);
    toast.success(`"${itemToDelete.name}" deleted from menu.`);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    refreshMenu();
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search menu item or Urdu / نام سے تلاش کریں..."
            className="w-64"
          />

          <div className="w-48">
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.name, label: `${c.name} (${c.arabicName})` })),
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between ${
                !item.isAvailable ? 'opacity-65' : ''
              }`}
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Badge variant={item.isAvailable ? 'success' : 'danger'} size="sm">
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{item.name}</h4>
                  <p className="text-[11px] font-urdu text-slate-500 truncate">{item.arabicName}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">{item.price.toFixed(2)} SAR</span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Cost: {item.costPrice.toFixed(2)} SAR
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`p-1.5 rounded-md cursor-pointer ${
                        item.isAvailable
                          ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                    >
                      {item.isAvailable ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Item Name / نام (اردو)</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell className="text-right">Selling Price</TableHeaderCell>
              <TableHeaderCell className="text-right">Cost Price</TableHeaderCell>
              <TableHeaderCell className="text-right">Profit Margin</TableHeaderCell>
              <TableHeaderCell>Availability</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => {
              const margin = item.price > 0 ? ((item.price - item.costPrice) / item.price) * 100 : 0;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs font-urdu text-slate-500">{item.arabicName}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-slate-700">{item.category}</span>
                  </TableCell>

                  <TableCell className="text-right font-bold text-slate-900">{formatSAR(item.price)}</TableCell>
                  <TableCell className="text-right text-slate-600">{formatSAR(item.costPrice)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={margin >= 50 ? 'success' : 'info'} size="sm">
                      {margin.toFixed(0)}%
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={item.isAvailable ? 'success' : 'danger'} size="sm">
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                        title={item.isAvailable ? 'Set Out of Stock' : 'Set Available'}
                      >
                        {item.isAvailable ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Item Name (English)"
              placeholder="e.g. Chicken Shawarma Platter"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Item Name / ڈش کا نام (اردو)"
              placeholder="مثال: چکن شاورما پلیٹر"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              options={categories.map((c) => ({ value: c.name, label: c.name }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Selling Price (SAR)"
              type="number"
              step="0.5"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Food Cost Price (SAR)"
              type="number"
              step="0.5"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Dish Image: Dual Option (Upload from Computer OR Paste Web URL) */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Dish Photo / تصویر
              </label>

              {/* Mode Switcher: Upload vs URL */}
              <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-white text-[#ea6918] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    imageInputMode === 'url'
                      ? 'bg-white text-[#ea6918] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {/* Live Preview Box */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Dish Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <ImageIcon className="w-7 h-7 stroke-1" />
                      <span className="text-[9px] font-medium text-slate-400 mt-1">No Photo</span>
                    </div>
                  )}
                </div>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-transform group-hover:scale-110"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Upload Input or URL Input */}
              <div className="flex-1 min-w-0">
                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#ea6918] bg-white hover:bg-orange-50/20 rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#ea6918] transition-colors" />
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-[#ea6918]">
                        Click to upload photo from your computer
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WebP (up to 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      placeholder="Paste image web link (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400">
                      Paste direct web image link (Unsplash, Google, or any hosted image)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Description / Ingredients"
            placeholder="Marinated chicken with garlic paste, pickles and fries"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Available in POS Terminal for Ordering
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Menu Item?"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}" from this branch's menu?`}
        confirmText="Delete Item"
      />
    </div>
  );
};
