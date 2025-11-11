#!/bin/bash
# Test script for newsletter API

API_URL="http://localhost:3001"

echo "Testing Newsletter API..."
echo ""

# Test 1: Subscribe to newsletter
echo "Test 1: Subscribe to newsletter"
curl -X POST "$API_URL/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Try to subscribe again (should fail)
echo "Test 2: Try duplicate subscription"
curl -X POST "$API_URL/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Invalid email
echo "Test 3: Invalid email format"
curl -X POST "$API_URL/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Tests completed!"
