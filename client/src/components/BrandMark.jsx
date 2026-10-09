import arovaMark from '../assets/arova-mark.svg';

export default function BrandMark({ className = '', decorative = false }) {
  return <img className={className} src={arovaMark} alt={decorative ? '' : 'Arova'} aria-hidden={decorative ? true : undefined} />;
}
