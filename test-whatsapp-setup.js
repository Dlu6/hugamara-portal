#!/usr/bin/env node

/**
 * WhatsApp Business Number Test Script
 * 
 * This script helps you test your WhatsApp Business number setup
 * before integrating with the full system.
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './mayday/slave-backend/.env' });

const API_BASE_URL = process.env.LIPACHAT_GATEWAY_URL || 'https://gateway.lipachat.com/api/v1/whatsapp';
const API_KEY = process.env.LIPACHAT_API_KEY;
const PHONE_NUMBER = process.env.LIPACHAT_PHONE_NUMBER;

console.log('🔍 WhatsApp Business Number Test');
console.log('================================');

// Check environment variables
console.log('\n📋 Configuration Check:');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Phone Number: ${PHONE_NUMBER ? '✅ Set' : '❌ Missing'}`);
console.log(`API Key: ${API_KEY ? '✅ Set' : '❌ Missing'}`);

if (!PHONE_NUMBER || !API_KEY) {
  console.log('\n❌ Error: Missing required environment variables');
  console.log('Please set LIPACHAT_PHONE_NUMBER and LIPACHAT_API_KEY in your .env file');
  process.exit(1);
}

// Test API connectivity
async function testApiConnectivity() {
  console.log('\n🌐 Testing API Connectivity...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/status`, {
      headers: {
        'apiKey': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API is accessible');
    console.log(`Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ API connectivity failed');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Test phone number format
function testPhoneNumberFormat() {
  console.log('\n📱 Testing Phone Number Format...');
  
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  if (phoneRegex.test(PHONE_NUMBER)) {
    console.log('✅ Phone number format is valid');
    console.log(`Number: ${PHONE_NUMBER}`);
    return true;
  } else {
    console.log('❌ Phone number format is invalid');
    console.log('Expected format: +1234567890 (with country code)');
    return false;
  }
}

// Test webhook configuration
async function testWebhookConfig() {
  console.log('\n🔗 Testing Webhook Configuration...');
  
  const webhookUrl = `${process.env.API_BASE_URL || 'http://localhost:8004'}/api/whatsapp/webhook`;
  console.log(`Webhook URL: ${webhookUrl}`);
  
  try {
    const response = await axios.get(webhookUrl, { timeout: 5000 });
    console.log('✅ Webhook endpoint is accessible');
    return true;
  } catch (error) {
    console.log('⚠️  Webhook endpoint not accessible (this is normal if server is not running)');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('\n🚀 Running Tests...');
  
  const results = {
    phoneFormat: testPhoneNumberFormat(),
    apiConnectivity: await testApiConnectivity(),
    webhookConfig: await testWebhookConfig()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Phone Number Format: ${results.phoneFormat ? '✅' : '❌'}`);
  console.log(`API Connectivity: ${results.apiConnectivity ? '✅' : '❌'}`);
  console.log(`Webhook Configuration: ${results.webhookConfig ? '✅' : '⚠️'}`);
  
  const allPassed = results.phoneFormat && results.apiConnectivity;
  
  if (allPassed) {
    console.log('\n🎉 All critical tests passed!');
    console.log('Your WhatsApp Business number is ready for integration.');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
  }
  
  return allPassed;
}

// Run the tests
runTests().catch(console.error);
