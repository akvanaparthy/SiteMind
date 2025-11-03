/**
 * Quick script to check what data exists in the database
 */

import { makeRequest } from '../utils/api-client.js';

const API_BASE = '/api';

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  try {
    // Check site status
    console.log('📡 Site Status:');
    const siteStatus = await makeRequest('/site?type=status', 'GET');
    console.log(JSON.stringify(siteStatus, null, 2));
    console.log('');

    // Check users (via logs endpoint which should exist)
    console.log('📊 Agent Logs:');
    const logs = await makeRequest('/logs', 'GET');
    console.log(`Total logs: ${(logs.data?.logs?.length as number) || 0}`);
    console.log('');

    // Check posts
    console.log('📝 Blog Posts (all):');
    try {
      const posts = await makeRequest('/posts', 'GET');
      console.log(JSON.stringify(posts, null, 2));
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
    console.log('');

    // Check tickets
    console.log('🎫 Tickets (all):');
    try {
      const tickets = await makeRequest('/tickets', 'GET');
      console.log(JSON.stringify(tickets, null, 2));
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
    console.log('');

    // Check orders
    console.log('🛒 Orders (all):');
    try {
      const orders = await makeRequest('/orders', 'GET');
      console.log(JSON.stringify(orders, null, 2));
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase().catch(console.error);
