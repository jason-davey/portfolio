#!/usr/bin/env node

// Script to test all v0.dev components

import { V0ComponentTester } from '../src/components/v0/utils/v0ComponentTester.js'

async function runV0Tests() {
  console.log('🧪 Running v0.dev Component Tests')
  console.log('==================================\n')
  
  try {
    const results = await V0ComponentTester.testAllComponents()
    
    console.log('\n📊 Detailed Results:')
    console.log('====================')
    
    results.forEach(result => {
      console.log(`\n📦 ${result.componentName} (${result.componentId})`)
      console.log(`   Basic Tests: ${result.basicTests ? '✅' : '❌'}`)
      console.log(`   Voiceflow Integration: ${result.voiceflowTests ? '✅' : '❌'}`)
      console.log(`   Adventure Paths: ${result.pathTests ? '✅' : '❌'}`)
      console.log(`   Overall: ${result.overallSuccess ? '✅ PASS' : '❌ FAIL'}`)
    })
    
    const passCount = results.filter(r => r.overallSuccess).length
    const totalCount = results.length
    
    console.log(`\n🎯 Final Score: ${passCount}/${totalCount} components passing`)
    
    if (passCount === totalCount) {
      console.log('🎉 All v0 components are working correctly!')
      process.exit(0)
    } else {
      console.log('⚠️  Some components need attention')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error)
    process.exit(1)
  }
}

// Run tests if called directly
if (process.argv[1].endsWith('test-v0-components.js')) {
  runV0Tests()
}