'use client';

import { Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const MantineMotionBase = forwardRef<HTMLDivElement, any>((props, ref) => (
  <Box ref={ref} {...props} />
));

MantineMotionBase.displayName = 'MantineMotionBase';

export const MotionBox = motion.create(MantineMotionBase);
