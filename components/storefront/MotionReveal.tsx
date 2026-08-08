'use client';

import { Transition } from '@mantine/core';
import { PropsWithChildren, useEffect, useState } from 'react';

type MotionRevealProps = PropsWithChildren<{
  transition?: 'fade' | 'fade-down' | 'fade-up' | 'slide-left' | 'slide-right';
  duration?: number;
}>;

export function MotionReveal({
  children,
  transition = 'fade-up',
  duration = 700,
}: MotionRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Transition mounted={mounted} transition={transition} duration={duration} timingFunction="ease">
      {(styles) => <div style={styles}>{children}</div>}
    </Transition>
  );
}
