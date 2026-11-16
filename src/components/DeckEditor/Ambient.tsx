import { Particles } from '../Particles/Particles';
import { Meteors } from '../Meteors/Meteors';
import type { AmbientType } from './deck';

export const Ambient = ({ type }: { type: AmbientType }) => {
	switch(type)
	{
	case 'particles': return <Particles quantity={60} className='h-full w-full' />;
	case 'meteors':   return <Meteors count={16} className='h-full w-full' />;
	case 'none':      return null;
	}
};

export const ambientBackdrop = (type: AmbientType) => (type === 'none' ? undefined : <Ambient type={type} />);
