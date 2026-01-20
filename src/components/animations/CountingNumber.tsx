import { useEffect, useState, useRef } from 'react';

interface CountingNumberProps {
    value: number | string;
    duration?: number;
}

export function CountingNumber({ value, duration = 1500 }: CountingNumberProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    const target = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
    const suffix = typeof value === 'string' ? value.replace(/[0-9]/g, '') : '';

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                    setCount(0);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        if (isNaN(target)) return;

        let start = 0;
        const end = target;
        const increment = end / (duration / 16);
        let current = 0;

        const animate = () => {
            current += increment;
            if (current < end) {
                setCount(Math.floor(current));
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animate();
    }, [isVisible, target, duration]);

    return <span ref={containerRef}>{count}{suffix}</span>;
}
