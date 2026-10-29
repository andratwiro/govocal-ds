// A type test, run by `npm run typecheck` (tsconfig.json includes tests/types), never executed. The layout parts take
// spacing token names only: each `@ts-expect-error` line must fail to compile, or tsc fails on the unused directive.
import {Grid, GridItem, Inline, Stack} from 'govocal-ds';

export const tokens = (
  <Stack gap="16" padding="24">
    <Inline gap="8" rowGap="4" paddingInline="12">a</Inline>
    <Grid columns={2} gap="16" columnGap="24"><GridItem columnSpan="all">b</GridItem></Grid>
  </Stack>
);

export const raw = (
  <>
    {/* @ts-expect-error a pixel value is not a token name */}
    <Stack gap="13px" />
    {/* @ts-expect-error a number is not a token name */}
    <Stack gap={13} />
    {/* @ts-expect-error a step off the scale */}
    <Stack gap="13" />
    {/* @ts-expect-error a token step as a number still isn't the token's name */}
    <Inline gap={16} />
    {/* @ts-expect-error padding is a token too */}
    <Inline padding="13px" />
    {/* @ts-expect-error */}
    <Grid gap="13px" />
    {/* @ts-expect-error */}
    <Grid rowGap={13} />
    {/* @ts-expect-error a var() is not a name either */}
    <Grid paddingBlock="var(--gv-space-16)" />
  </>
);
