import React from 'react';
import { metadata } from '@/app/layout';
import RootLayout from '@/app/layout';

describe('US-33: Localized SEO & OpenGraph Root Layout Configuration', () => {
  it('configures SEO metadata tailored for Iberian and Latin American tabletop markets', () => {
    expect(metadata.title).toBeDefined();
    if (typeof metadata.title === 'object' && metadata.title !== null && 'default' in metadata.title) {
      const titleObj = metadata.title as { default: string; template?: string };
      expect(titleObj.default).toContain('MeeplePrecios');
      expect(titleObj.default).toMatch(/España|Latinoamérica/i);
      expect(titleObj.template).toBe('%s | MeeplePrecios');
    } else if (typeof metadata.title === 'string') {
      expect(metadata.title).toContain('MeeplePrecios');
      expect(metadata.title).toMatch(/España|Latinoamérica/i);
    } else {
      fail('metadata.title should be configured with SEO title or template');
    }

    expect(metadata.description).toBeDefined();
    expect(metadata.description).toMatch(/España|Latinoamérica/i);
    expect(metadata.description).toMatch(/juegos de mesa/i);

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBeDefined();
    expect(metadata.openGraph?.description).toBeDefined();
    expect(metadata.openGraph?.locale).toMatch(/^es/);
    expect((metadata.openGraph as { type?: string })?.type).toBe('website');
  });

  it('sets root html lang attribute to es for regional targeting', () => {
    const layoutElement = RootLayout({ children: <div data-testid="test-child">Content</div> }) as React.ReactElement<{ lang?: string }>;
    expect(layoutElement.props.lang).toBe('es');
  });
});
