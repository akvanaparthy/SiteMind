@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Testing All 20 Remaining New Tools
echo ========================================
echo.

set count=0
set passed=0
set failed=0

:: Customer Tools (2 remaining)
echo [5/24] Testing: flag_customer
npm run test:agent "Flag customer 18 for review due to suspicious activity with high severity"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [6/24] Testing: get_customer_stats
npm run test:agent "Get lifetime statistics for customer 18"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

:: Product Tools (6 tools)
echo.
echo [7/24] Testing: update_product_stock
npm run test:agent "Set stock for product 1 to 50 units"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [8/24] Testing: update_product_price
npm run test:agent "Update price for product 2 to 299.99"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [9/24] Testing: toggle_product_availability
npm run test:agent "Disable product 3"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [10/24] Testing: get_low_stock_products
npm run test:agent "Show me all products with low stock under 20 units"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [11/24] Testing: create_product
npm run test:agent "Create a new product called Wireless Mouse priced at 29.99 with 100 units in stock"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [12/24] Testing: bulk_update_products
npm run test:agent "Bulk update: set stock for product 1 to 75 units and product 2 to 60 units"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

:: Analytics Tools (6 tools)
echo.
echo [13/24] Testing: get_revenue_report
npm run test:agent "Show me revenue report for the last 30 days grouped by week"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [14/24] Testing: get_top_products
npm run test:agent "Show me top 5 best selling products by revenue"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [15/24] Testing: get_customer_satisfaction
npm run test:agent "Calculate customer satisfaction score"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [16/24] Testing: get_conversion_rate
npm run test:agent "Get conversion rate for the last 30 days"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [17/24] Testing: export_analytics_report
npm run test:agent "Export revenue report in CSV format for last month"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [18/24] Testing: get_sales_forecast
npm run test:agent "Forecast sales for next 7 days"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

:: Content Tools (6 tools)
echo.
echo [19/24] Testing: schedule_post
npm run test:agent "Schedule post 1 to publish on 2025-12-01"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [20/24] Testing: generate_blog_content
npm run test:agent "Generate a blog post about AI in ecommerce with professional tone and 500 words"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [21/24] Testing: optimize_post_seo
npm run test:agent "Optimize SEO for post 2"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [22/24] Testing: get_post_analytics
npm run test:agent "Get analytics for post 1"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [23/24] Testing: bulk_schedule_posts
npm run test:agent "Schedule posts 2 and 3 starting from 2025-11-10 with 3 day intervals"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)
timeout /t 2 /nobreak >nul

echo.
echo [24/24] Testing: manage_static_pages
npm run test:agent "Create a new page called About Us with content about our company"
if !errorlevel! equ 0 (set /a passed+=1) else (set /a failed+=1)

echo.
echo ========================================
echo TEST SUMMARY
echo ========================================
echo Total Tests: 20
echo Passed: !passed!
echo Failed: !failed!
echo ========================================

if !failed! equ 0 (
  echo All tests passed!
) else (
  echo Some tests failed. Review output above.
)
