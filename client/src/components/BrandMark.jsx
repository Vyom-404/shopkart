export default function BrandMark({ className = '', decorative = false }) {
  return <img className={className} src="/arova-mark.svg" alt={decorative ? '' : 'Arova'} aria-hidden={decorative ? true : undefined} />;
}
