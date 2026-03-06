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
  duration = 1.0,
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(0, {
    mass: 0.6,
    stiffness: 90,
    damping: 18,
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
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

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
  duration = 1.0,
  className = '',
}: AnimatedCurrencyProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Snappier spring with a satisfying overshoot feel
  const spring = useSpring(0, {
    mass: 0.5,
    stiffness: 100,
    damping: 16,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(Math.max(current, 0)));
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

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
