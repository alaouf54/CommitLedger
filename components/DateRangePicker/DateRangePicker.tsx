'use client';

import { useState, useMemo } from 'react';
import { subDays, subMonths, format } from 'date-fns';
import styles from './DateRangePicker.module.css';

type Preset = '7d' | '30d' | '90d' | 'custom';

interface DateRangePickerProps {
  onRangeChange: (since: string, until: string) => void;
}

export default function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>('30d');
  const [customSince, setCustomSince] = useState('');
  const [customUntil, setCustomUntil] = useState('');

  const today = useMemo(() => new Date(), []);

  const presets: { key: Preset; label: string }[] = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 3 months' },
    { key: 'custom', label: 'Custom' },
  ];

  const handlePresetClick = (preset: Preset) => {
    setActivePreset(preset);

    if (preset === 'custom') return;

    let since: Date;
    switch (preset) {
      case '7d':
        since = subDays(today, 7);
        break;
      case '30d':
        since = subDays(today, 30);
        break;
      case '90d':
        since = subMonths(today, 3);
        break;
    }

    onRangeChange(since.toISOString(), today.toISOString());
  };

  const handleCustomChange = (newSince: string, newUntil: string) => {
    setCustomSince(newSince);
    setCustomUntil(newUntil);

    if (newSince && newUntil) {
      onRangeChange(
        new Date(newSince).toISOString(),
        new Date(newUntil + 'T23:59:59').toISOString()
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Date Range</span>
      <div className={styles.presets}>
        {presets.map((p) => (
          <button
            key={p.key}
            className={`${styles.presetBtn} ${activePreset === p.key ? styles.active : ''}`}
            onClick={() => handlePresetClick(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activePreset === 'custom' && (
        <div className={styles.customRange}>
          <input
            type="date"
            className={styles.dateInput}
            value={customSince}
            max={format(today, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomChange(e.target.value, customUntil)}
          />
          <span className={styles.separator}>to</span>
          <input
            type="date"
            className={styles.dateInput}
            value={customUntil}
            max={format(today, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomChange(customSince, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
