/**
 * Individual Tool Testing Script
 * Test one tool at a time with manual review between tests
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

async function testTool(toolName: string, command: string) {
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`🧪 TESTING: ${toolName}`);
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`📝 Command: "${command}"`);
  logger.info('');

  try {
    const result = await executeCommand(command);
    
    logger.info('');
    logger.info('✅ RESPONSE RECEIVED:');
    logger.info('═══════════════════════════════════════════════════');
    logger.info(result.output);
    logger.info('═══════════════════════════════════════════════════');
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(result.output);
      logger.info('');
      logger.info('✅ JSON VALIDATION: PASSED');
      logger.info('📊 Parsed Structure:');
      logger.info(`   - status: ${parsed.status}`);
      logger.info(`   - action: ${parsed.action}`);
      logger.info(`   - message: ${parsed.message}`);
      logger.info(`   - has data: ${!!parsed.data}`);
      logger.info(`   - has logs: ${!!parsed.logs}`);
    } catch (e) {
      logger.error('');
      logger.error('❌ JSON VALIDATION: FAILED');
      logger.error('Response is not valid JSON');
    }
    
    return true;
  } catch (error: any) {
    logger.error('');
    logger.error('❌ TOOL EXECUTION FAILED');
    logger.error(error.message);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    logger.error('Usage: tsx test-individual-tool.ts <tool-name> "<command>"');
    logger.error('Example: tsx test-individual-tool.ts getSiteStatusTool "Show me site status"');
    process.exit(1);
  }
  
  const toolName = args[0];
  const command = args[1];
  
  await testTool(toolName, command);
  process.exit(0);
}

main();
