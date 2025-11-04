# API Testing Guide

Quick reference for testing all new API endpoints.

## Prerequisites
```bash
# Start the Next.js server
cd c:\Disk\Projs\SiteMind
npm run dev
```

---

## 👥 Customer APIs

### Get Customer Details
```bash
curl http://localhost:3000/api/customers/1
```

### Update Customer Info
```bash
curl -X PUT http://localhost:3000/api/customers/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Updated\",\"email\":\"john@example.com\"}"
```

### Get Customer Orders
```bash
curl http://localhost:3000/api/customers/1/orders?limit=5
```

### Get Customer Tickets
```bash
curl http://localhost:3000/api/customers/1/tickets?status=OPEN
```

### Flag Customer
```bash
curl -X POST http://localhost:3000/api/customers/1/flag ^
  -H "Content-Type: application/json" ^
  -d "{\"reason\":\"Suspicious activity\",\"severity\":\"HIGH\"}"
```

### Get Customer Statistics
```bash
curl http://localhost:3000/api/customers/1/stats
```

---

## 📦 Product APIs

### Update Product Stock (Set Mode)
```bash
curl -X PATCH http://localhost:3000/api/products/1/stock ^
  -H "Content-Type: application/json" ^
  -d "{\"quantity\":100,\"mode\":\"set\"}"
```

### Update Product Stock (Adjust Mode)
```bash
curl -X PATCH http://localhost:3000/api/products/1/stock ^
  -H "Content-Type: application/json" ^
  -d "{\"quantity\":-5,\"mode\":\"adjust\"}"
```

### Update Product Price
```bash
curl -X PATCH http://localhost:3000/api/products/1/price ^
  -H "Content-Type: application/json" ^
  -d "{\"price\":29.99}"
```

### Toggle Product Availability
```bash
curl -X PATCH http://localhost:3000/api/products/1/availability ^
  -H "Content-Type: application/json" ^
  -d "{\"active\":false}"
```

### Get Low Stock Products
```bash
curl http://localhost:3000/api/products/low-stock?threshold=10
```

### Bulk Update Products
```bash
curl -X POST http://localhost:3000/api/products/bulk-update ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"update_price\",\"productIds\":[1,2,3],\"value\":19.99}"
```

---

## 📊 Analytics APIs

### Get Revenue Report
```bash
curl "http://localhost:3000/api/analytics/revenue?startDate=2025-10-01&endDate=2025-11-03&groupBy=day"
```

### Get Top Products
```bash
curl "http://localhost:3000/api/analytics/top-products?limit=5&sortBy=revenue&period=30d"
```

### Get Customer Satisfaction Score
```bash
curl "http://localhost:3000/api/analytics/csat?period=30d"
```

### Get Conversion Rate
```bash
curl "http://localhost:3000/api/analytics/conversion-rate?period=30d"
```

### Export Report
```bash
curl -X POST http://localhost:3000/api/analytics/export ^
  -H "Content-Type: application/json" ^
  -d "{\"reportType\":\"revenue\",\"format\":\"csv\",\"startDate\":\"2025-10-01\",\"endDate\":\"2025-11-03\"}"
```

### Get Sales Forecast
```bash
curl "http://localhost:3000/api/analytics/forecast?period=30d"
```

---

## 📝 Content APIs

### Schedule Post
```bash
curl -X POST http://localhost:3000/api/posts/1/schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"publishDate\":\"2025-12-01T10:00:00Z\"}"
```

### Generate Post Content (AI)
```bash
curl -X POST http://localhost:3000/api/posts/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"topic\":\"AI in E-commerce\",\"tone\":\"professional\",\"length\":\"medium\"}"
```

### Get SEO Optimization
```bash
curl -X POST http://localhost:3000/api/posts/1/seo ^
  -H "Content-Type: application/json"
```

### Get Post Analytics
```bash
curl "http://localhost:3000/api/posts/1/analytics?period=30d"
```

### Bulk Schedule Posts
```bash
curl -X POST http://localhost:3000/api/posts/bulk-schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"postIds\":[1,2,3],\"startDate\":\"2025-12-01T10:00:00Z\",\"interval\":\"1d\"}"
```

### Create Static Page
```bash
curl -X POST http://localhost:3000/api/pages ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"About Us\",\"slug\":\"about\",\"content\":\"# About Us\n\nWelcome to our site!\",\"template\":\"default\"}"
```

---

## 🤖 Testing with AI Agent

### Start Agent Service
```bash
cd c:\Disk\Projs\SiteMind\api-agent
npm run dev
```

### Test Agent Commands
The agent can now execute commands like:

```
"Get customer 1 details"
"Update product 2 stock to 50"
"Show me revenue report for last 30 days"
"Schedule post 3 for next Monday"
"Flag customer 5 for suspicious activity"
"Get top 10 products by revenue"
"Generate a blog post about AI trends"
```

---

## 🔍 Response Format

All endpoints return JSON in this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "note": "Optional note about mock features"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## 📝 Notes

- **Mock Features:** Some endpoints (AI generation, analytics, exports) return mock data with notes
- **Date Formats:** Use ISO 8601 format: `2025-11-03T10:00:00Z`
- **IDs:** Most IDs are integers (use existing IDs from your database)
- **Permissions:** No authentication implemented yet (add as needed)

---

## ✅ Quick Validation

Test that all systems are working:

```bash
# 1. Test a customer endpoint
curl http://localhost:3000/api/customers/1/stats

# 2. Test a product endpoint
curl http://localhost:3000/api/products/low-stock

# 3. Test an analytics endpoint
curl http://localhost:3000/api/analytics/revenue

# 4. Test a content endpoint
curl -X POST http://localhost:3000/api/posts/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"topic\":\"Test Topic\"}"
```

If all return JSON responses, you're ready to go! 🚀
