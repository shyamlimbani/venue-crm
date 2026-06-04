import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Building2, Upload, Trash2, ShieldAlert,
  Image as ImageIcon, RefreshCw, CheckCircle2 
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function BrandingSettings() {
  const { user } = useAuth();
  const { branding, refreshBranding } = useBranding();
  
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    if (branding) {
      setCompanyName(branding.companyName || 'Venue CRM');
      setTagline(branding.tagline || 'Enterprise Edition');
      setLogoPreview(branding.logo || '');
      setFaviconPreview(branding.favicon || '');
    }
  }, [branding]);

  const handleLogoUpload = (e) => {
    if (!isAdmin) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setLogoPreview(base64Data);
        try {
          setLoading(true);
          await api.put('/api/branding/logo', { logo: base64Data });
          toast.success('Logo uploaded successfully');
          refreshBranding();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to upload logo');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    if (!isAdmin) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Favicon image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setFaviconPreview(base64Data);
        try {
          setLoading(true);
          await api.put('/api/branding/logo', { favicon: base64Data });
          toast.success('Favicon uploaded successfully');
          refreshBranding();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to upload favicon');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAsset = async (type) => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      await api.delete(`/api/branding/logo?type=${type}`);
      if (type === 'logo') {
        setLogoPreview('');
        toast.success('Logo removed');
      } else {
        setFaviconPreview('');
        toast.success('Favicon removed');
      }
      refreshBranding();
    } catch (err) {
      toast.error('Failed to remove asset');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTextChanges = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setLoading(true);
      await api.put('/api/branding', { companyName, tagline });
      toast.success('Branding text updated successfully');
      refreshBranding();
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Building2 className="text-black" />
          Branding & Identity Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure company name, taglines, app logos, and browser favicons</p>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
          <ShieldAlert size={20} className="text-gray-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Read-Only Access</h4>
            <p className="text-xs text-gray-500 mt-1">Only system administrators can modify branding assets and identity properties.</p>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner className="py-6" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column - Metadata inputs */}
        <form onSubmit={handleSaveTextChanges} className="card-modern bg-white space-y-4">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Identity Details</h3>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Company Name</label>
            <input 
              type="text" 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="input-modern"
              placeholder="e.g. Venue CRM"
              disabled={!isAdmin}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">CRM Tagline</label>
            <input 
              type="text" 
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="input-modern"
              placeholder="e.g. Enterprise Edition"
              disabled={!isAdmin}
            />
          </div>

          {isAdmin && (
            <button type="submit" className="btn-primary w-full mt-6">
              Save Branding Text
            </button>
          )}
        </form>

        {/* Right Column - Logo & Favicon Uploaders */}
        <div className="space-y-6">
          {/* Logo Card */}
          <div className="card-modern bg-white space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Company Logo</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Logo Preview box */}
              <div className="w-32 h-32 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden shrink-0 shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full p-2 object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <ImageIcon size={24} className="text-gray-300" />
                    <span className="text-[10px] text-gray-400">No Logo</span>
                  </div>
                )}
              </div>

              {/* Upload actions */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Supported Formats: PNG, JPG, JPEG, SVG, WEBP.<br />
                  Maximum file size: **5MB**.
                </p>
                
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <label className="btn-outline min-h-0 py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer bg-white border-gray-200 hover:bg-gray-100">
                      <Upload size={14} />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                    
                    {logoPreview && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveAsset('logo')}
                        className="btn-outline min-h-0 py-2 px-4 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Remove Logo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="card-modern bg-white space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Browser Favicon</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Favicon Preview box */}
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden shrink-0 shadow-inner">
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Favicon Preview" className="max-w-full max-h-full p-2 object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1 p-2 text-center">
                    <ImageIcon size={16} className="text-gray-300" />
                    <span className="text-[9px] text-gray-400">No Favicon</span>
                  </div>
                )}
              </div>

              {/* Upload actions */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Automatically changes website favicon in tab bar.<br />
                  Max file size: **5MB**.
                </p>
                
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <label className="btn-outline min-h-0 py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer bg-white border-gray-200 hover:bg-gray-100">
                      <Upload size={14} />
                      {faviconPreview ? 'Change Favicon' : 'Upload Favicon'}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp" 
                        onChange={handleFaviconUpload} 
                        className="hidden" 
                      />
                    </label>
                    
                    {faviconPreview && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveAsset('favicon')}
                        className="btn-outline min-h-0 py-2 px-4 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Remove Favicon
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
