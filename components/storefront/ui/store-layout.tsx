'use client';

import { Container, ContainerProps, Group, Stack, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';

export function StorePageContainer({ children, ...props }: ContainerProps) {
  return (
    <Container
      fluid
      px={{ base: 'md', md: 'xl' }}
      py={{ base: 'xl', md: 56 }}
      style={{ width: '100%', minWidth: 0 }}
      {...props}
    >
      {children}
    </Container>
  );
}

export function StorePageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Group
      justify="space-between"
      align="flex-end"
      gap="lg"
      mb="xl"
      pb="lg"
      wrap="wrap"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Stack gap="xs" style={{ minWidth: 0 }}>
        <Title
          order={1}
          tt="uppercase"
          style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', lineHeight: 1 }}
        >
          {title}
        </Title>
        {description ? (
          <Text size="sm" c="dimmed" maw={620} lh={1.7}>
            {description}
          </Text>
        ) : null}
      </Stack>
      {action}
    </Group>
  );
}
