#!/bin/bash

echo "Testing API endpoints..."

echo "1. Testing health endpoint:"
curl -X GET http://localhost:3001/api/v1/health
echo -e "\n"

echo "2. Testing register endpoint:"
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "username": "testuser"
  }'
echo -e "\n"

echo "3. Testing OTP request endpoint:"
curl -X POST http://localhost:3001/api/v1/auth/otp/request-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
echo -e "\n"