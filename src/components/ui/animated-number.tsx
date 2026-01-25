import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    const formatted = current.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring]);

  // When value changes after initial animation, animate to new value
  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

// Currency-specific variant with proper formatting
interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  locale?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCurrency({
  value,
  currency = 'CAD',
  locale = 'en-CA',
  duration = 1.2,
  className = '',
}: AnimatedCurrencyProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(current));
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
