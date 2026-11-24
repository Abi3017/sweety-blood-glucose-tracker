import { ArrowUp, ArrowDown, Sigma, Hash } from 'lucide-react';
import StatCard from '../common/StatCard';

/** Highest / lowest / average / count. `stats` is null when there are no readings. */
export default function StatsGrid({ stats }) {
  return (
    <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Highest reading" value={stats?.highest} icon={ArrowUp} tone="brand" />
      <StatCard label="Lowest reading" value={stats?.lowest} icon={ArrowDown} tone="mint" />
      <StatCard label="Average reading" value={stats ? stats.average.toFixed(1) : null} icon={Sigma} tone="brand" />
      <StatCard label="Total readings" value={stats ? stats.count : null} unit="" icon={Hash} tone="slate" />
    </div>
  );
}
