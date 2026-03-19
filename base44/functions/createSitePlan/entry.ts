import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Notion access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');
    
    // Create the site plan page in Notion
    const sitePlanContent = {
      parent: {
        type: "workspace"
      },
      title: [
        {
          type: "text",
          text: {
            content: "RUGLY Site Plan & Design System"
          }
        }
      ],
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: "RUGLY Site Plan & Design System" } ]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "Complete visual identity and site structure guide for Rugly Floors" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "🎨 Brand Identity" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Primary Color Palette" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Primary Blue: #3B5BDB (bold, modern, trustworthy)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "White: #FFFFFF (contrast, clean)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Dark Gray/Black: #1F2937 (text, depth)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Light Gray: #F3F4F6 (backgrounds, dividers)" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Typography" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Display Font: 'Big Shoulders Stencil Display' (buttons, CTAs, bold headers)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Heading Font: 'Barlow Condensed' (page titles, section headers)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Body Font: 'Barlow Condensed' (paragraphs, descriptions)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Accent Font: 'Baumans' (special highlights, callouts)" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "🏗️ Site Structure" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Main Navigation Pages" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Home - Hero section, featured products, process overview, brand story" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Build Your Rug (CustomBuilder) - Multi-step design interface with real-time preview" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Shop Originals (Shop) - Browse & purchase pre-made Rugly designs" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Commission Rugley - Custom commission inquiry form" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "About - Brand story, founder bio, mission statement" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Blog - Design tips, rug care, inspiration" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Contact - Customer support & inquiries" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "My Orders - Customer order tracking & history" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Admin Pages (Protected)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Admin Portal - Dashboard hub for all admin functions" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Product Management - Add/edit/delete original Rugly products" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Order Management - View, update, and track customer orders" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Customer Inbox - Manage contact form submissions" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "SEO Management - Configure page metadata & schemas" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "🎯 Key Components" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Header/Navigation - Sticky navigation with logo, menu links, shopping cart" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Hero Section - Full-width video background with overlay, headline, CTAs" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Product Cards - Image carousel, title, description, price, action buttons" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Custom Builder Interface - Multi-step form, design tools, live preview" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Shopping Cart - Item management, quantity adjustment, checkout flow" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Footer - Contact info, social links, terms, admin link" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "📱 Responsive Design" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Mobile-first approach with Tailwind CSS breakpoints" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Desktop: Full multi-column layouts, expanded navigation" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Tablet: Optimized 2-column grids, touch-friendly spacing" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Mobile: Single column, hamburger menu, scaled images & text" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "🛒 E-commerce Features" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Stripe payment processing with live mode enabled" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Product variants (sizes, colors, customization options)" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Dynamic pricing based on customization complexity" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Order tracking and status updates" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Email notifications (confirmation, status updates, shipping)" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "🎨 Design System - Visual Hierarchy" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Buttons & CTAs" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Primary: Blue background, white text, bold border effect" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Secondary: White background, blue border, blue text" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Ghost: Transparent background, white/blue border (hero section)" } ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "Cards & Containers" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Rounded corners (lg), subtle shadows, light gray backgrounds" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Padding/spacing: Generous 16px-24px for breathing room" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "✨ Unique Features" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Real-time rug preview canvas - visual feedback during design" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Drawing & stencil tools - create or upload designs" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "AI-powered product generation - auto-create descriptions & pricing" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Notion integration - sync orders & product info" } ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "📊 Data & Analytics" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Product database: Name, description, pricing, images, inventory" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Order database: Customer info, items, status, payment, tracking" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Contact submissions: Tracked in inbox for admin review" } ]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "SEO metadata: Per-page customizable titles, descriptions, keywords" } ]
          }
        }
      ]
    };

    // Create the page in Notion
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sitePlanContent)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      return Response.json({ error: 'Failed to create Notion document', details: error }, { status: 500 });
    }

    const notionPage = await response.json();
    
    return Response.json({ 
      success: true, 
      message: 'Site plan created in Notion',
      pageId: notionPage.id,
      pageUrl: notionPage.url
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});