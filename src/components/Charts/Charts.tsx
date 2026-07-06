'use client';
import {
	Area,
	AreaChart as RechartsAreaChart,
	Bar,
	BarChart as RechartsBarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	Pie,
	PieChart as RechartsPieChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart as RechartsRadarChart,
	ResponsiveContainer,
	Sector,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { useState } from 'react';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ChartDataPoint
{
	[key: string]: string | number;
}

export interface ChartSeries
{
	key:    string;
	label:  string;
	color?: string;
}

interface BaseChartProps
{
	data:        ChartDataPoint[];
	xKey:        string;
	series:      ChartSeries[];
	height?:     number;
	showLegend?: boolean;
	showGrid?:   boolean;
	className?:  string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
	'var(--color-brand)',
	'var(--color-danger)',
	'#10b981',
	'#f59e0b',
	'#8b5cf6',
	'#06b6d4',
];

const ANIMATION_DURATION = 600;
const ANIMATION_EASING   = 'ease-out';

const AXIS_TICK    = { fontSize: 11, fill: 'var(--color-text-muted)' } as const;
const LEGEND_STYLE = { fontSize: '12px', color: 'var(--color-text-muted)' } as const;

const seriesColor = (s: ChartSeries, i: number) => {
	return s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
};

const ChartTooltip = (
    {
        active,
        payload,
        label,
    }: {
        active?:  boolean;
        payload?: Array<{ name: string; value: number | string; color: string }>;
        label?:   string;
    }
) => {
	if(!active || !payload?.length) return null;

	return (
		<div
			style={{
				backgroundColor: 'var(--color-surface)',
				border:          '1px solid var(--color-surface-border)',
				borderRadius:    8,
				padding:         '8px 12px',
				boxShadow:       '0 4px 16px rgba(0,0,0,0.1)',
				minWidth:        120,
			}}
		>
			{label && (
				<p
					style={{
						color:         'var(--color-text-muted)',
						fontSize:      11,
						fontWeight:    600,
						marginBottom:  6,
						letterSpacing: '0.04em',
						textTransform: 'uppercase',
					}}
				>
					{label}
				</p>
			)}
			{payload.map((p, i) => (
				<div
					key={i}
					style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 4 : 0 }}
				>
					<span
						style={{
							display:      'inline-block',
							width:        8,
							height:       8,
							borderRadius: '50%',
							background:   p.color,
							flexShrink:   0,
						}}
					/>
					<span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{p.name}</span>
					<span
						style={{
							color:       'var(--color-text)',
							fontSize:    12,
							fontWeight:  600,
							marginLeft:  'auto',
							paddingLeft: 16,
						}}
					>
						{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
					</span>
				</div>
			))}
		</div>
	);
};

// ─── LineChart ────────────────────────────────────────────────────────────────

export type LineChartProps = BaseChartProps;

export const LineChart = (
    {
        data,
        xKey,
        series,
        height     = 240,
        showLegend = true,
        showGrid   = true,
        className  = '',
    }: LineChartProps
) => {
	return (
		<div className={`w-full ${className}`} style={{ height }} role='img' aria-label='Line chart'>
			<ResponsiveContainer width='100%' height='100%'>
				<RechartsLineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--color-surface-border)'
							vertical={false}
						/>
					)}
					<XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<Tooltip
						content={(props) => <ChartTooltip {...(props as unknown as Parameters<typeof ChartTooltip>[0])} />}
						cursor={{ stroke: 'var(--color-surface-border)', strokeWidth: 1, strokeDasharray: '4 2' }}
					/>
					{showLegend && <Legend wrapperStyle={LEGEND_STYLE} iconType='circle' iconSize={8} />}
					{series.map((s, i) => {
						const color = seriesColor(s, i);
						return (
							<Line
								key={s.key}
								type='monotone'
								dataKey={s.key}
								name={s.label}
								stroke={color}
								strokeWidth={2}
								dot={{ r: 3, fill: color, strokeWidth: 0 }}
								activeDot={{ r: 5, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
								animationDuration={ANIMATION_DURATION}
								animationEasing={ANIMATION_EASING}
							/>
						);
					})}
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
};

// ─── BarChart ─────────────────────────────────────────────────────────────────

export interface BarChartProps extends BaseChartProps
{
	stacked?: boolean;
}

export const BarChart = (
    {
        data,
        xKey,
        series,
        height     = 240,
        showLegend = true,
        showGrid   = true,
        stacked    = false,
        className  = '',
    }: BarChartProps
) => {
	return (
		<div className={`w-full ${className}`} style={{ height }} role='img' aria-label='Bar chart'>
			<ResponsiveContainer width='100%' height='100%'>
				<RechartsBarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barGap={4}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--color-surface-border)'
							vertical={false}
						/>
					)}
					<XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<Tooltip
						content={(props) => <ChartTooltip {...(props as unknown as Parameters<typeof ChartTooltip>[0])} />}
						cursor={{ fill: 'var(--color-surface-hover)' }}
					/>
					{showLegend && <Legend wrapperStyle={LEGEND_STYLE} iconType='circle' iconSize={8} />}
					{series.map((s, i) => (
						<Bar
							key={s.key}
							dataKey={s.key}
							name={s.label}
							fill={seriesColor(s, i)}
							radius={stacked && i < series.length - 1 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
							stackId={stacked ? 'stack' : undefined}
							maxBarSize={40}
							animationDuration={ANIMATION_DURATION}
							animationEasing={ANIMATION_EASING}
						/>
					))}
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
};

// ─── AreaChart ────────────────────────────────────────────────────────────────

export interface AreaChartProps extends BaseChartProps
{
	stacked?: boolean;
}

export const AreaChart = (
    {
        data,
        xKey,
        series,
        height     = 240,
        showLegend = true,
        showGrid   = true,
        stacked    = false,
        className  = '',
    }: AreaChartProps
) => {
	return (
		<div className={`w-full ${className}`} style={{ height }} role='img' aria-label='Area chart'>
			<ResponsiveContainer width='100%' height='100%'>
				<RechartsAreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
					<defs>
						{series.map((s, i) => {
							const color = seriesColor(s, i);
							return (
								<linearGradient key={s.key} id={`gradient-${s.key}`} x1='0' y1='0' x2='0' y2='1'>
									<stop offset='5%'  stopColor={color} stopOpacity={0.25} />
									<stop offset='95%' stopColor={color} stopOpacity={0.02} />
								</linearGradient>
							);
						})}
					</defs>
					{showGrid && (
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--color-surface-border)'
							vertical={false}
						/>
					)}
					<XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
					<Tooltip
						content={(props) => <ChartTooltip {...(props as unknown as Parameters<typeof ChartTooltip>[0])} />}
						cursor={{ stroke: 'var(--color-surface-border)', strokeWidth: 1, strokeDasharray: '4 2' }}
					/>
					{showLegend && <Legend wrapperStyle={LEGEND_STYLE} iconType='circle' iconSize={8} />}
					{series.map((s, i) => {
						const color = seriesColor(s, i);
						return (
							<Area
								key={s.key}
								type='monotone'
								dataKey={s.key}
								name={s.label}
								stroke={color}
								strokeWidth={2}
								fill={`url(#gradient-${s.key})`}
								dot={{ r: 3, fill: color, strokeWidth: 0 }}
								activeDot={{ r: 5, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
								stackId={stacked ? 'stack' : undefined}
								animationDuration={ANIMATION_DURATION}
								animationEasing={ANIMATION_EASING}
							/>
						);
					})}
				</RechartsAreaChart>
			</ResponsiveContainer>
		</div>
	);
};

// ─── DonutChart ───────────────────────────────────────────────────────────────

interface ActiveSectorProps
{
	cx:          number;
	cy:          number;
	startAngle:  number;
	endAngle:    number;
	fill?:       string;
}

export interface DonutSlice
{
	label:  string;
	value:  number;
	color?: string;
}

export interface DonutChartProps
{
	data:         DonutSlice[];
	innerRadius?: number;
	height?:      number;
	showLegend?:  boolean;
	className?:   string;
}

export const DonutChart = (
    {
        data,
        innerRadius = 0.65,
        height      = 240,
        showLegend  = true,
        className   = '',
    }: DonutChartProps
) => {
	const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

	const outerR = Math.floor(height * 0.38);
	const innerR = Math.floor(outerR * innerRadius);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const activeIndexProp: any = { activeIndex };

	return (
		<div className={`w-full ${className}`} style={{ height }} role='img' aria-label='Donut chart'>
			<ResponsiveContainer width='100%' height='100%'>
				<RechartsPieChart>
					<Pie
						data={data}
						dataKey='value'
						nameKey='label'
						cx='50%'
						cy='50%'
						innerRadius={innerR}
						outerRadius={outerR}
						paddingAngle={2}
						strokeWidth={0}
						{...activeIndexProp}
						activeShape={(props: ActiveSectorProps) =>
						{
							const { cx, cy, startAngle, endAngle, fill } = props;
							return (
								<Sector
									cx={cx}
									cy={cy}
									innerRadius={innerR - 2}
									outerRadius={outerR + 6}
									startAngle={startAngle}
									endAngle={endAngle}
									fill={fill}
								/>
							);
						}}
						onMouseEnter={(_, index) => setActiveIndex(index)}
						onMouseLeave={() => setActiveIndex(undefined)}
						animationDuration={ANIMATION_DURATION}
						animationEasing={ANIMATION_EASING}
					>
						{data.map((slice, i) => (
							<Cell
								key={slice.label}
								fill={slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
								style={{ cursor: 'pointer', outline: 'none' }}
							/>
						))}
					</Pie>
					<Tooltip content={(props) => <ChartTooltip {...(props as unknown as Parameters<typeof ChartTooltip>[0])} />} />
					{showLegend && <Legend wrapperStyle={LEGEND_STYLE} iconType='circle' iconSize={8} />}
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
};

// ─── RadarChart ───────────────────────────────────────────────────────────────

export type RadarChartProps = BaseChartProps;

export const RadarChart = (
    {
        data,
        xKey,
        series,
        height     = 240,
        showLegend = true,
        showGrid   = true,
        className  = '',
    }: RadarChartProps
) => {
	return (
		<div className={`w-full ${className}`} style={{ height }} role='img' aria-label='Radar chart'>
			<ResponsiveContainer width='100%' height='100%'>
				<RechartsRadarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
					{showGrid && <PolarGrid stroke='var(--color-surface-border)' />}
					<PolarAngleAxis dataKey={xKey} tick={AXIS_TICK} />
					<PolarRadiusAxis tick={false} axisLine={false} />
					<Tooltip content={(props) => <ChartTooltip {...(props as unknown as Parameters<typeof ChartTooltip>[0])} />} />
					{showLegend && <Legend wrapperStyle={LEGEND_STYLE} iconType='circle' iconSize={8} />}
					{series.map((s, i) => {
						const color = seriesColor(s, i);
						return (
							<Radar
								key={s.key}
								dataKey={s.key}
								name={s.label}
								stroke={color}
								strokeWidth={2}
								fill={color}
								fillOpacity={0.15}
								dot={{ r: 3, fill: color, strokeWidth: 0 }}
								animationDuration={ANIMATION_DURATION}
								animationEasing={ANIMATION_EASING}
							/>
						);
					})}
				</RechartsRadarChart>
			</ResponsiveContainer>
		</div>
	);
};
