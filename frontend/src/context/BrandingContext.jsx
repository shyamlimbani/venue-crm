import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const BrandingContext = createContext(null);

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    companyName: 'Venue CRM',
    tagline: 'Enterprise Edition',
    logo: '',
    favicon: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const { data } = await api.get('/api/branding');
      if (data.success && data.data) {
        setBranding({
          companyName: data.data.companyName || 'Venue CRM',
          tagline: data.data.tagline || 'Enterprise Edition',
          logo: data.data.logo || '',
          favicon: data.data.favicon || ''
        });
      }
    } catch (err) {
      console.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  useEffect(() => {
    if (branding?.favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.favicon;
    } else {
      let link = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = '/favicon.ico';
      }
    }
  }, [branding.favicon]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
