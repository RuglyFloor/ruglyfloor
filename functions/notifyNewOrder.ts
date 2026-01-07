import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { orderData } = await req.json();

        // Send email to business owner
        await base44.integrations.Core.SendEmail({
            from_name: 'Rugly Orders',
            to: 'orders@ruglyfloor.com', // Replace with your actual email
            subject: `New Order Received - ${orderData.order_number}`,
            body: `
                <h2>New Custom Rug Order!</h2>
                <p><strong>Order Number:</strong> ${orderData.order_number}</p>
                <p><strong>Customer:</strong> ${orderData.customer_name}</p>
                <p><strong>Email:</strong> ${orderData.customer_email}</p>
                <p><strong>Phone:</strong> ${orderData.customer_phone || 'N/A'}</p>
                <p><strong>Total Amount:</strong> $${orderData.total_amount}</p>
                
                <h3>Order Items:</h3>
                <ul>
                ${orderData.items.map(item => `
                    <li>
                        ${item.name} - ${item.size}<br>
                        Base Color: ${item.baseColor}, Paint Color: ${item.paintColor}<br>
                        ${item.is3D ? '3-D Effect' : 'Standard'}<br>
                        Price: $${item.price}
                        ${item.previewUrl ? `<br><img src="${item.previewUrl}" style="max-width: 300px; margin-top: 10px;">` : ''}
                    </li>
                `).join('')}
                </ul>
                
                <h3>Shipping Address:</h3>
                <p>
                    ${orderData.shipping_address.street}<br>
                    ${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.zip}<br>
                    ${orderData.shipping_address.country}
                </p>
            `
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});