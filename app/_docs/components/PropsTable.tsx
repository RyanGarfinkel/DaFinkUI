interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

interface PropsTableProps {
  rows: PropRow[];
}

export const PropsTable = ({ rows }: PropsTableProps) => {
  return (
    <div className='w-full overflow-x-auto'>
      <table className='w-full border-collapse text-left'>
        <thead>
          <tr>
            <th className='border-b border-surface-border pb-2 text-xs font-medium text-text-muted uppercase tracking-wide pr-6'>
              Name
            </th>
            <th className='border-b border-surface-border pb-2 text-xs font-medium text-text-muted uppercase tracking-wide pr-6'>
              Type
            </th>
            <th className='border-b border-surface-border pb-2 text-xs font-medium text-text-muted uppercase tracking-wide pr-6'>
              Default
            </th>
            <th className='border-b border-surface-border pb-2 text-xs font-medium text-text-muted uppercase tracking-wide'>
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className='border-b border-surface-border'>
              <td className='py-3 pr-6 font-mono text-sm text-text align-top'>
                {row.name}
              </td>
              <td className='py-3 pr-6 font-mono text-sm text-text-muted align-top'>
                {row.type}
              </td>
              <td className='py-3 pr-6 font-mono text-sm text-text-muted align-top'>
                {row.default}
              </td>
              <td className='py-3 text-sm text-text-muted align-top'>
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
