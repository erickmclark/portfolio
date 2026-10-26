import { describe, expect, it } from 'vitest';
import {
  CONTACT_INTENT_COPY,
  CONTACT_INTENT_IDS,
  FACTORY_AREA_OF_SUPPORT,
  GOVERNANCE_PLATFORM_PRODUCT,
  contactHref,
  resolveContactPrefill,
} from './contact';

describe('resolveContactPrefill', () => {
  it('defaults to the first intent with no values', () => {
    expect(resolveContactPrefill({})).toEqual({ intent: 'leadership', values: {} });
  });
  it('falls back safely on unknown or array-valued type', () => {
    expect(resolveContactPrefill({ type: 'nope' }).intent).toBe('leadership');
    expect(resolveContactPrefill({ type: ['speaking', 'build'] }).intent).toBe('speaking');
  });
  it('resolves every intent', () => {
    for (const id of CONTACT_INTENT_IDS) expect(resolveContactPrefill({ type: id }).intent).toBe(id);
  });
  it('preselects the Factory area (D22) and the governance platform (D23)', () => {
    expect(resolveContactPrefill({ type: 'advisory', area: FACTORY_AREA_OF_SUPPORT }).values).toEqual({
      areaOfSupport: FACTORY_AREA_OF_SUPPORT,
    });
    expect(resolveContactPrefill({ type: 'product', product: GOVERNANCE_PLATFORM_PRODUCT }).values).toEqual({
      product: GOVERNANCE_PLATFORM_PRODUCT,
    });
  });
  it('ignores unknown options and preselects for the wrong intent', () => {
    expect(resolveContactPrefill({ type: 'advisory', area: 'Bogus' }).values).toEqual({});
    expect(resolveContactPrefill({ type: 'general', area: FACTORY_AREA_OF_SUPPORT }).values).toEqual({});
    expect(resolveContactPrefill({ type: 'advisory', product: GOVERNANCE_PLATFORM_PRODUCT }).values).toEqual({});
  });
  it('round-trips hrefs from contactHref', () => {
    const href = contactHref('product', { name: 'product', value: GOVERNANCE_PLATFORM_PRODUCT });
    const q = Object.fromEntries(new URL(href, 'http://x').searchParams);
    expect(resolveContactPrefill(q)).toEqual({
      intent: 'product',
      values: { product: GOVERNANCE_PLATFORM_PRODUCT },
    });
  });
  it('has copy for every intent', () => {
    for (const id of CONTACT_INTENT_IDS) expect(CONTACT_INTENT_COPY[id].submit).toBeTruthy();
  });
});
