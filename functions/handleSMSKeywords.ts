import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { from, body } = await req.json();
    
    const keyword = body.trim().toUpperCase();
    let responseMessage = '';
    
    if (keyword === 'STOP' || keyword === 'UNSUBSCRIBE' || keyword === 'CANCEL' || keyword === 'END' || keyword === 'QUIT') {
      // Handle opt-out
      responseMessage = 'You have been unsubscribed from Rugly Floors text messages. You will no longer receive texts from us. Reply START to resubscribe.';
      
      // Update customer SMS consent in database if they exist
      const customers = await base44.asServiceRole.entities.Customer.filter({ phone: from });
      if (customers.length > 0) {
        await base44.asServiceRole.entities.Customer.update(customers[0].id, {
          sms_opted_out: true
        });
      }
    } else if (keyword === 'HELP' || keyword === 'INFO') {
      responseMessage = 'Rugly Floors - Custom hand-painted rugs. For help, call (517) 777-8474 or email contact@ruglyfloor.com. Msg&data rates may apply. Reply STOP to unsubscribe.';
    } else if (keyword === 'START' || keyword === 'SUBSCRIBE' || keyword === 'YES') {
      responseMessage = 'You have successfully subscribed to Rugly Floors text updates. We\'ll send you order updates and notifications. Reply STOP to unsubscribe or HELP for help.';
      
      // Update customer SMS consent in database if they exist
      const customers = await base44.asServiceRole.entities.Customer.filter({ phone: from });
      if (customers.length > 0) {
        await base44.asServiceRole.entities.Customer.update(customers[0].id, {
          sms_opted_out: false
        });
      }
    }
    
    return Response.json({ 
      success: true,
      message: responseMessage 
    });
  } catch (error) {
    console.error('SMS keyword handling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});