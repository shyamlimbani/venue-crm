import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Eye, Pencil, Trash2, Calendar, 
  FileText, Download, Wallet, CreditCard, ArrowRight,
  TrendingDown, Check, X, Upload
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/constants';

const CATEGORIES = [
  'Electricity',
  'Staff Salary',
  'Maintenance',
  'Marketing',
  'Cleaning',
  'Studio Equipment',
  'Cricket Ground',
  'Marriage Ground',
  'Office Expense',
  'Miscellaneous'
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card'];

export default function Expenses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ today: 0, month: 0, year: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Miscellaneous',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'UPI',
    attachment: ''
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = { filter, category, search };
      if (filter === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const { data } = await api.get('/api/expenses', { params });
      setExpenses(data.data);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/expenses/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load expense statistics');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter, category, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchExpenses();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchStats();
  }, [expenses]);

  const openForm = (exp = null) => {
    if (exp) {
      setEditingExpense(exp);
      setForm({
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        date: new Date(exp.date).toISOString().split('T')[0],
        description: exp.description || '',
        paymentMethod: exp.paymentMethod,
        attachment: exp.attachment || ''
      });
    } else {
      setEditingExpense(null);
      setForm({
        title: '',
        category: 'Miscellaneous',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'UPI',
        attachment: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Bill/Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, attachment: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense._id}`, payload);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/api/expenses', payload);
        toast.success('Expense recorded successfully');
      }
      setIsFormOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense record deleted');
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  // PDF statement generator
  const downloadPDFReport = () => {
    if (expenses.length === 0) {
      toast.error('No expense records to download for this selection');
      return;
    }
    
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    const logoSrc = branding?.logo;
    let headerOffset = 20;

    if (logoSrc && (logoSrc.startsWith('data:image/png') || logoSrc.startsWith('data:image/jpeg') || logoSrc.startsWith('data:image/jpg') || logoSrc.startsWith('data:image/webp'))) {
      try {
        doc.addImage(logoSrc, 'JPEG', 14, 12, 24, 12);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("EXPENSE REPORT", 145, 20);
        headerOffset = 28;
      } catch (err) {
        console.error('Failed to render logo in PDF', err);
      }
    } else {
      // Title Banner (fallback only)
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(branding?.companyName || "VENUE CRM", 14, headerOffset - 4);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(branding?.tagline || "Enterprise Edition", 14, headerOffset);
    }
    doc.line(14, headerOffset + 4, 196, headerOffset + 4);
    headerOffset += 4;
    
    // Metadata block
    const now = new Date();
    let durationLabel = 'Selected Period';
    if (filter === 'today') durationLabel = 'Today';
    else if (filter === 'week') durationLabel = 'This Week';
    else if (filter === 'month') durationLabel = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();
    
    doc.setFontSize(10);
    doc.text(`Report Period: ${durationLabel}`, 14, headerOffset + 8);
    doc.text(`Generated On: ${now.toLocaleString()}`, 14, headerOffset + 14);
    
    const grandTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    doc.text(`Total Records: ${expenses.length}`, 14, headerOffset + 20);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: INR ${grandTotal.toLocaleString('en-IN')}`, 14, headerOffset + 26);
    doc.setFont("helvetica", "normal");
    
    doc.line(14, headerOffset + 32, 196, headerOffset + 32);
    
    // Table Headers
    let y = headerOffset + 40;
    doc.setFont("helvetica", "bold");
    doc.text("Date", 14, y);
    doc.text("Title", 45, y);
    doc.text("Category", 110, y);
    doc.text("Amount (INR)", 160, y);
    doc.setFont("helvetica", "normal");
    
    doc.line(14, y + 3, 196, y + 3);
    y += 10;
    
    // Table content rows
    expenses.forEach((exp) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFont("helvetica", "bold");
        doc.text("Date", 14, y);
        doc.text("Title", 45, y);
        doc.text("Category", 110, y);
        doc.text("Amount (INR)", 160, y);
        doc.setFont("helvetica", "normal");
        doc.line(14, y + 3, 196, y + 3);
        y += 10;
      }
      
      const formattedDate = new Date(exp.date).toLocaleDateString('en-IN');
      doc.text(formattedDate, 14, y);
      doc.text(exp.title.substring(0, 30), 45, y);
      doc.text(exp.category, 110, y);
      doc.text(`Rs. ${exp.amount.toLocaleString('en-IN')}`, 160, y);
      
      y += 8;
    });
    
    doc.line(14, y, 196, y);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${grandTotal.toLocaleString('en-IN')}`, 130, y + 10);
    
    doc.save(`Expense_Report_${durationLabel.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF Statement downloaded');
  };

  // CSV statement exporter
  const downloadCSVReport = () => {
    if (expenses.length === 0) {
      toast.error('No expense records to export');
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Added By'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString('en-IN'),
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.category,
      exp.amount,
      exp.paymentMethod,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
      exp.addedBy?.name || 'System'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Statement exported');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor company expenditures, salaries, and utility bills</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/expenses/reports')} 
            className="btn-outline flex items-center gap-2 text-sm bg-white"
          >
            Expense Reports <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => openForm()} 
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Today's Expenses", value: stats.today, bg: "bg-white border-gray-200" },
          { label: "Month's Expenses", value: stats.month, bg: "bg-white border-gray-200" },
          { label: "Year's Expenses", value: stats.year, bg: "bg-white border-gray-200 border-l-4 border-l-black" }
        ].map((c) => (
          <motion.div 
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-modern ${c.bg} p-5 flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(c.value)}</p>
            </div>
            <div className="p-3 bg-gray-50 text-black border border-gray-250 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-modern bg-white p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 p-1 bg-gray-150 rounded-lg w-fit border border-gray-200 shadow-inner">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map(f => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${filter === f.id ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black hover:bg-gray-200/50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-wrap gap-3 items-center">
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-modern min-h-0 py-1.5 px-3 max-w-[180px] text-xs bg-white border-gray-200"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Export Buttons */}
            <button 
              onClick={downloadPDFReport}
              className="btn-outline min-h-0 py-1.5 px-3 text-xs flex items-center gap-1.5 bg-white border-gray-200"
              title="Download Monthly Expense PDF"
            >
              <FileText size={14} /> PDF Report
            </button>

            <button 
              onClick={downloadCSVReport}
              className="btn-outline min-h-0 py-1.5 px-3 text-xs flex items-center gap-1.5 bg-white border-gray-200"
              title="Export statement as CSV/Excel"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Custom Date Filters & Text Search */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex-1 max-w-md flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus-within:border-black transition-all">
            <Search size={16} className="text-gray-400" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search expenses by title/description..."
              className="w-full text-xs bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {filter === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="input-modern min-h-0 py-1.5 px-2 text-xs max-w-[130px] bg-white border-gray-200"
              />
              <span className="text-xs text-gray-400">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="input-modern min-h-0 py-1.5 px-2 text-xs max-w-[130px] bg-white border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Expense Directory Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-modern bg-white p-0 overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Title</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Category</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Added By</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{e.title}</div>
                      {e.description && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{e.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-50 border-gray-200 text-gray-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-950">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {e.addedBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setViewingExpense(e); setIsDetailOpen(true); }}
                        className="p-1.5 rounded bg-gray-50 hover:bg-gray-150 border border-gray-200 text-gray-600 hover:text-black transition-colors"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => openForm(e)}
                            className="p-1.5 rounded bg-gray-50 hover:bg-gray-150 border border-gray-200 text-gray-600 hover:text-black transition-colors"
                            title="Edit Expense"
                          >
                            <Pencil size={12} />
                          </button>
                          <button 
                            onClick={() => handleDelete(e._id)}
                            className="p-1.5 rounded bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No expense records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record / Edit Expense Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Expense Title *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              className="input-modern" 
              placeholder="e.g. Monthly Electricity Bill"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category *</label>
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})} 
                className="input-modern bg-white text-gray-900"
                required
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Amount (₹) *</label>
              <input 
                type="number" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                className="input-modern" 
                min="1"
                placeholder="0"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Expense Date *</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
                className="input-modern" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Payment Method *</label>
              <select 
                value={form.paymentMethod} 
                onChange={e => setForm({...form, paymentMethod: e.target.value})} 
                className="input-modern bg-white text-gray-900"
                required
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              className="input-modern h-20 py-2 resize-none" 
              placeholder="Provide context or bill references..."
            />
          </div>

          {/* Attachment upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Attachment (Bill / Receipt Image)</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="relative shrink-0 w-12 h-12 rounded-lg bg-gray-100 border border-gray-250 flex items-center justify-center text-gray-400 overflow-hidden">
                {form.attachment ? (
                  <img src={form.attachment} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={20} />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[9px] text-white">
                  <Upload size={14} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {form.attachment ? 'Receipt Loaded' : 'No Receipt Attached'}
                </p>
                <p className="text-[10px] text-gray-400">Optional. Max file size: 2MB</p>
              </div>
              {form.attachment && (
                <button 
                  type="button" 
                  onClick={() => setForm(f => ({...f, attachment: ''}))}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-black transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editingExpense ? 'Update Expense' : 'Record Expense'}</button>
          </div>
        </form>
      </Modal>

      {/* View Expense Detail Modal */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title="Expense Voucher Details"
        size="lg"
      >
        {viewingExpense && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewingExpense.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-200/60 px-2 py-0.5 border border-gray-300 rounded mt-1.5 inline-block">
                  {viewingExpense.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Spent</p>
                <p className="text-2xl font-black text-black">{formatCurrency(viewingExpense.amount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                <p className="text-xs text-gray-400">Voucher Date</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {new Date(viewingExpense.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                <p className="text-xs text-gray-400">Payment Mode</p>
                <p className="font-semibold text-gray-800 mt-0.5">{viewingExpense.paymentMethod}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                <p className="text-xs text-gray-400">Authorized By</p>
                <p className="font-semibold text-gray-800 mt-0.5">{viewingExpense.addedBy?.name || 'System'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                <p className="text-xs text-gray-400">Created Timestamp</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {new Date(viewingExpense.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {viewingExpense.description && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Notes / Description</p>
                <p className="text-gray-800 leading-relaxed font-sans">{viewingExpense.description}</p>
              </div>
            )}

            {viewingExpense.attachment && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-400 mb-2.5 font-medium">Attached Voucher File / Bill Image</p>
                <div className="max-w-md mx-auto aspect-video rounded-lg overflow-hidden border border-gray-300 shadow bg-white flex items-center justify-center">
                  <img src={viewingExpense.attachment} alt="Voucher Bill Attachment" className="max-h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
