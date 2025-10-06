# Runbook — HubSpot → Supabase Membership Sync

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

## ✅ **CURRENT STATUS: FULLY OPERATIONAL**

### **HubSpot Configuration**
- **Contact Property**: `membership_status___amaa` (label: "Active if member is active")
- **Private App**: Created with `crm.objects.contacts.read` scope
- **Webhook**: Active subscription for `contact.propertyChange` on `membership_status___amaa`
- **Target URL**: `https://ffgjqlmulaqtfopgwenf.supabase.co/functions/v1/hubspot-contact-upsert`
- **Security**: X-HubSpot-Signature verification enabled

### **Supabase Configuration**
- **Edge Function**: `hubspot-contact-upsert` deployed and active
- **JWT Verification**: Disabled for webhook endpoint
- **Environment Variables**: 
  - `HUBSPOT_ACCESS_TOKEN`: Set for contact email lookup
  - `HUBSPOT_APP_SECRET`: Set for signature verification
  - `ALLOWED_ORIGIN`: Set for CORS

## **How It Works**

### **Webhook Flow**
1. **HubSpot Contact Property Change** → Webhook triggered
2. **Webhook Payload** → Sent to Supabase Edge Function
3. **Contact Email Lookup** → Function fetches email via HubSpot API v3
4. **Database Update** → Member record upserted in Supabase
5. **WordPress Plugin** → Calls `/me` function to check membership status

### **Edge Function: `hubspot-contact-upsert`**
- **Method**: POST (webhook or direct API call)
- **Webhook Payload**:
  ```json
  [{
    "objectId": "1749001",
    "propertyName": "membership_status___amaa",
    "propertyValue": "Active",
    "subscriptionType": "contact.propertyChange"
  }]
  ```
- **Direct API Payload**:
  ```json
  {
    "email": "someone@example.com",
    "membership_status___amaa": "Active",
    "membership_level": "Individual"
  }
  ```

### **Database Logic**
- **Upsert** into `members` table by email (lowercased)
- **Set** `is_member = (membership_status___amaa === "Active")`
- **Set** `membership_level` if provided
- **Idempotency** via email-based upsert

## **Testing & Verification**

### **Test the Webhook**
1. **Change membership status** in HubSpot (Active ↔ Lapsed)
2. **Check Supabase logs** for 200 status
3. **Verify database** - member record updated
4. **Test WordPress** - `/me` function returns correct status

### **Test the Plugin**
1. **Visit test page**: `https://marketrepstg.wpenginepowered.com/?page_id=15`
2. **Login with magic link**
3. **Check debug info** - shows membership status
4. **Verify content gating** - member-only content shows/hides correctly

## **Troubleshooting**

### **Common Issues**
- **401 Errors**: JWT verification re-enabled after deployment (disable in Supabase Dashboard)
- **No Member Created**: Check HubSpot API call logs in function
- **CORS Errors**: Verify `ALLOWED_ORIGIN` is set correctly
- **Webhook Not Firing**: Check HubSpot webhook subscription status

### **Debug Commands**
```bash
# Check recent webhook logs
# Check member records
# Test /me function directly
```

## **Notes**
- **Real-time sync**: Membership changes sync immediately via webhooks
- **Fallback**: If webhook fails, manual API calls can update membership
- **Caching**: WordPress plugin caches membership status for 5 minutes
- **Security**: Webhook signature verification prevents unauthorized calls