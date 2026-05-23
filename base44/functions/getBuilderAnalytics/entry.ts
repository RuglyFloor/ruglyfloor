import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GA4_PROPERTY_ID = 'properties/520357623'; // www.ruglyfloor.com

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    const { dateRange = '30daysAgo' } = await req.json().catch(() => ({}));

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    // Run all GA4 reports in parallel
    const [funnelRes, tierRes, sizeRes, colorRes, dropoffRes] = await Promise.all([
      // 1. Builder funnel steps
      fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['view_item', 'builder_size_selected', 'builder_base_color_selected', 'builder_paint_color_selected', 'builder_design_uploaded', 'builder_preview_generated', 'add_to_cart', 'begin_checkout', 'purchase'],
              },
            },
          },
        }),
      }),

      // 2. Tier popularity (from view_item)
      fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'eventName' }, { name: 'customEvent:item_id' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: { fieldName: 'eventName', stringFilter: { value: 'view_item' } },
          },
        }),
      }),

      // 3. Size selection breakdown
      fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'customEvent:size_id' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: { fieldName: 'eventName', stringFilter: { value: 'builder_size_selected' } },
          },
        }),
      }),

      // 4. Color selections
      fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'customEvent:color_name' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: { fieldName: 'eventName', stringFilter: { value: 'builder_paint_color_selected' } },
          },
        }),
      }),

      // 5. Builder page sessions (daily trend)
      fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }, { name: 'pagePath' }],
          metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
          dimensionFilter: {
            filter: { fieldName: 'pagePath', stringFilter: { value: '/CustomBuilder', matchType: 'CONTAINS' } },
          },
        }),
      }),
    ]);

    const [funnel, tiers, sizes, colors, trend] = await Promise.all([
      funnelRes.json(),
      tierRes.json(),
      sizeRes.json(),
      colorRes.json(),
      dropoffRes.json(),
    ]);

    const parseReport = (report) => {
      if (!report.rows) return [];
      return report.rows.map(row => ({
        dimensions: row.dimensionValues.map(d => d.value),
        metrics: row.metricValues.map(m => parseFloat(m.value) || 0),
      }));
    };

    return Response.json({
      funnel: parseReport(funnel),
      tiers: parseReport(tiers),
      sizes: parseReport(sizes),
      colors: parseReport(colors),
      trend: parseReport(trend),
    });
  } catch (error) {
    console.error('getBuilderAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});