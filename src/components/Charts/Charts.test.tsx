import { AreaChart, BarChart, DonutChart, LineChart } from './Charts';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const lineData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 2800 },
];

const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'expenses', label: 'Expenses' },
];

const donutData = [
  { label: 'Direct', value: 400 },
  { label: 'Referral', value: 300 },
  { label: 'Organic', value: 200 },
];

describe('LineChart', () => {
  it('renders without errors', () => {
    const { container } = render(
      <LineChart data={lineData} xKey='month' series={series} />,
    );
    expect(container).toBeTruthy();
  });
});

describe('BarChart', () => {
  it('renders without errors', () => {
    const { container } = render(
      <BarChart data={lineData} xKey='month' series={series} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders stacked variant', () => {
    const { container } = render(
      <BarChart data={lineData} xKey='month' series={series} stacked />,
    );
    expect(container).toBeTruthy();
  });
});

describe('AreaChart', () => {
  it('renders without errors', () => {
    const { container } = render(
      <AreaChart data={lineData} xKey='month' series={series} />,
    );
    expect(container).toBeTruthy();
  });
});

describe('DonutChart', () => {
  it('renders without errors', () => {
    const { container } = render(<DonutChart data={donutData} />);
    expect(container).toBeTruthy();
  });

  it('renders pie variant with innerRadius 0', () => {
    const { container } = render(<DonutChart data={donutData} innerRadius={0} />);
    expect(container).toBeTruthy();
  });
});
