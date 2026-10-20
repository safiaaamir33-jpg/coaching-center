import React, { createContext, useContext, useEffect, useState } from 'react';
import { AcademySettings } from '../types';
import { getAcademySettings, DEFAULT_ACADEMY_SETTINGS } from '../services/academyService';

import { applyDynamicTheme } from '../utils/theme';

interface AcademyContextType {
  settings: AcademySettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AcademyContext = createContext<AcademyContextType>({
  settings: DEFAULT_ACADEMY_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
});

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AcademySettings>(DEFAULT_ACADEMY_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await getAcademySettings();
      setSettings(data);
      applyDynamicTheme(data.primaryColor, data.accentColor);
    } catch (err) {
      console.warn('Failed to load academy settings, using fallback:', err);
      applyDynamicTheme(DEFAULT_ACADEMY_SETTINGS.primaryColor, DEFAULT_ACADEMY_SETTINGS.accentColor);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AcademySettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        applyDynamicTheme(customEvent.detail.primaryColor, customEvent.detail.accentColor);
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('bfa_settings_changed', handleSettingsChanged);
    return () => window.removeEventListener('bfa_settings_changed', handleSettingsChanged);
  }, []);

  useEffect(() => {
    applyDynamicTheme(settings?.primaryColor, settings?.accentColor);
  }, [settings?.primaryColor, settings?.accentColor]);

  return (
    <AcademyContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
