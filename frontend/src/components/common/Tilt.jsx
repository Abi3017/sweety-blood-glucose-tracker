import { useRef } from 'react';

/** Wrapper that tilts toward the mouse and shows a spotlight. Mouse-only; touch is unaffected. */
export default function Tilt({ as: Tag = 'div', max = 2, className = '', children, ...props }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(x - 0.5) * 2 * max}deg`);
    el.style.setProperty('--rx', `${-(y - 0.5) * 2 * max}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.classList.add('is-hover');
  };
  const onLeave = () => {
    const el = ref.current;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.classList.remove('is-hover');
  };

  return (
    <Tag ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt ${className}`} {...props}>
      {children}
    </Tag>
  );
}
