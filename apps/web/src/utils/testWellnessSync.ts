/**
 * Wellness Data Synchronization Test Utility
 * 
 * This utility helps test and verify the wellness data synchronization
 * between the frontend dashboard and the database.
 */

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface SyncTestSuite {
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
}

export class WellnessSyncTester {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl = '/api/v1', authToken: string | null = null) {
    this.baseUrl = baseUrl;
    this.authToken = authToken || localStorage.getItem('accessToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  private createTestResult(testName: string, passed: boolean, message: string, data?: any, error?: string): TestResult {
    return {
      testName,
      passed,
      message,
      data,
      error
    };
  }

  /**
   * Test API connectivity and authentication
   */
  async testAPIConnectivity(): Promise<TestResult> {
    try {
      const response = await this.makeRequest('/wellness/mood/history');
      
      if (response.status === 401) {
        return this.createTestResult(
          'API Connectivity',
          false,
          'Authentication failed - invalid or missing token',
          null,
          'Unauthorized'
        );
      }

      if (response.ok) {
        return this.createTestResult(
          'API Connectivity',
          true,
          'Successfully connected to wellness API'
        );
      }

      return this.createTestResult(
        'API Connectivity',
        false,
        `API request failed with status ${response.status}`,
        null,
        `HTTP ${response.status}`
      );
    } catch (error) {
      return this.createTestResult(
        'API Connectivity',
        false,
        'Failed to connect to API',
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Test mood data retrieval
   */
  async testMoodDataRetrieval(): Promise<TestResult> {
    try {
      const response = await this.makeRequest('/wellness/mood/history');
      
      if (!response.ok) {
        return this.createTestResult(
          'Mood Data Retrieval',
          false,
          `Failed to fetch mood data: ${response.status}`,
          null,
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return this.createTestResult(
          'Mood Data Retrieval',
          false,
          'Mood data is not in expected array format',
          data,
          'Invalid data format'
        );
      }

      // Validate data structure
      const validationErrors: string[] = [];
      data.forEach((entry, index) => {
        if (!entry.id) validationErrors.push(`Entry ${index}: Missing ID`);
        if (!entry.moodScore && !entry.mood) validationErrors.push(`Entry ${index}: Missing mood score`);
        if (!entry.createdAt) validationErrors.push(`Entry ${index}: Missing creation date`);
      });

      if (validationErrors.length > 0) {
        return this.createTestResult(
          'Mood Data Retrieval',
          false,
          `Data validation failed: ${validationErrors.join(', ')}`,
          data,
          'Data validation errors'
        );
      }

      return this.createTestResult(
        'Mood Data Retrieval',
        true,
        `Successfully retrieved ${data.length} mood entries`,
        { count: data.length, sample: data.slice(0, 2) }
      );
    } catch (error) {
      return this.createTestResult(
        'Mood Data Retrieval',
        false,
        'Error retrieving mood data',
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Test wellness goals retrieval
   */
  async testWellnessGoalsRetrieval(): Promise<TestResult> {
    try {
      const response = await this.makeRequest('/wellness/goals');
      
      if (!response.ok) {
        return this.createTestResult(
          'Wellness Goals Retrieval',
          false,
          `Failed to fetch wellness goals: ${response.status}`,
          null,
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return this.createTestResult(
          'Wellness Goals Retrieval',
          false,
          'Wellness goals data is not in expected array format',
          data,
          'Invalid data format'
        );
      }

      // Validate data structure
      const validationErrors: string[] = [];
      data.forEach((goal, index) => {
        if (!goal.id) validationErrors.push(`Goal ${index}: Missing ID`);
        if (!goal.name) validationErrors.push(`Goal ${index}: Missing name`);
        if (goal.target === undefined) validationErrors.push(`Goal ${index}: Missing target`);
        if (goal.current === undefined) validationErrors.push(`Goal ${index}: Missing current progress`);
      });

      if (validationErrors.length > 0) {
        return this.createTestResult(
          'Wellness Goals Retrieval',
          false,
          `Data validation failed: ${validationErrors.join(', ')}`,
          data,
          'Data validation errors'
        );
      }

      return this.createTestResult(
        'Wellness Goals Retrieval',
        true,
        `Successfully retrieved ${data.length} wellness goals`,
        { count: data.length, sample: data.slice(0, 2) }
      );
    } catch (error) {
      return this.createTestResult(
        'Wellness Goals Retrieval',
        false,
        'Error retrieving wellness goals',
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Test wellness insights retrieval
   */
  async testWellnessInsightsRetrieval(): Promise<TestResult> {
    try {
      const response = await this.makeRequest('/wellness/insights');
      
      if (!response.ok) {
        return this.createTestResult(
          'Wellness Insights Retrieval',
          false,
          `Failed to fetch wellness insights: ${response.status}`,
          null,
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      
      if (typeof data !== 'object' || data === null) {
        return this.createTestResult(
          'Wellness Insights Retrieval',
          false,
          'Wellness insights data is not in expected object format',
          data,
          'Invalid data format'
        );
      }

      // Check for expected fields
      const expectedFields = ['moodTrend', 'averageMood', 'moodEntriesCount'];
      const missingFields = expectedFields.filter(field => !(field in data));

      if (missingFields.length > 0) {
        return this.createTestResult(
          'Wellness Insights Retrieval',
          false,
          `Missing expected fields: ${missingFields.join(', ')}`,
          data,
          'Missing fields'
        );
      }

      return this.createTestResult(
        'Wellness Insights Retrieval',
        true,
        'Successfully retrieved wellness insights',
        data
      );
    } catch (error) {
      return this.createTestResult(
        'Wellness Insights Retrieval',
        false,
        'Error retrieving wellness insights',
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Test mood entry creation
   */
  async testMoodEntryCreation(): Promise<TestResult> {
    const testEntry = {
      moodScore: 4,
      energy: 3,
      stress: 2,
      notes: 'Test mood entry for synchronization testing',
      tags: ['test', 'sync-check']
    };

    try {
      const response = await this.makeRequest('/wellness/mood', {
        method: 'POST',
        body: JSON.stringify(testEntry)
      });

      if (!response.ok) {
        return this.createTestResult(
          'Mood Entry Creation',
          false,
          `Failed to create mood entry: ${response.status}`,
          testEntry,
          `HTTP ${response.status}`
        );
      }

      const createdEntry = await response.json();

      // Validate created entry
      if (!createdEntry.id) {
        return this.createTestResult(
          'Mood Entry Creation',
          false,
          'Created entry missing ID',
          createdEntry,
          'Missing ID'
        );
      }

      if (createdEntry.moodScore !== testEntry.moodScore) {
        return this.createTestResult(
          'Mood Entry Creation',
          false,
          'Mood score mismatch in created entry',
          { expected: testEntry.moodScore, actual: createdEntry.moodScore },
          'Data mismatch'
        );
      }

      return this.createTestResult(
        'Mood Entry Creation',
        true,
        'Successfully created mood entry',
        { created: createdEntry, original: testEntry }
      );
    } catch (error) {
      return this.createTestResult(
        'Mood Entry Creation',
        false,
        'Error creating mood entry',
        testEntry,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Test data consistency between endpoints
   */
  async testDataConsistency(): Promise<TestResult> {
    try {
      // Fetch data from multiple endpoints
      const [moodResponse, insightsResponse] = await Promise.all([
        this.makeRequest('/wellness/mood/history'),
        this.makeRequest('/wellness/insights')
      ]);

      if (!moodResponse.ok || !insightsResponse.ok) {
        return this.createTestResult(
          'Data Consistency',
          false,
          'Failed to fetch data for consistency check',
          null,
          'API request failed'
        );
      }

      const moodData = await moodResponse.json();
      const insightsData = await insightsResponse.json();

      // Check consistency
      const moodEntriesCount = Array.isArray(moodData) ? moodData.length : 0;
      const insightsMoodCount = insightsData.moodEntriesCount || 0;

      if (moodEntriesCount !== insightsMoodCount) {
        return this.createTestResult(
          'Data Consistency',
          false,
          `Mood entries count mismatch: mood endpoint reports ${moodEntriesCount}, insights reports ${insightsMoodCount}`,
          { moodEndpoint: moodEntriesCount, insightsEndpoint: insightsMoodCount },
          'Count mismatch'
        );
      }

      // Check average mood calculation
      if (moodEntriesCount > 0) {
        const calculatedAverage = moodData.reduce((sum: number, entry: any) => 
          sum + (entry.moodScore || entry.mood || 0), 0) / moodEntriesCount;
        
        const reportedAverage = insightsData.averageMood;
        
        if (reportedAverage !== null && Math.abs(calculatedAverage - reportedAverage) > 0.1) {
          return this.createTestResult(
            'Data Consistency',
            false,
            `Average mood calculation mismatch: calculated ${calculatedAverage.toFixed(2)}, reported ${reportedAverage}`,
            { calculated: calculatedAverage, reported: reportedAverage },
            'Calculation mismatch'
          );
        }
      }

      return this.createTestResult(
        'Data Consistency',
        true,
        'Data consistency check passed',
        { moodEntriesCount, insightsMoodCount }
      );
    } catch (error) {
      return this.createTestResult(
        'Data Consistency',
        false,
        'Error during consistency check',
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Run complete test suite
   */
  async runFullTestSuite(): Promise<SyncTestSuite> {
    console.log('🧪 Starting Wellness Data Synchronization Test Suite...');
    
    const tests = [
      () => this.testAPIConnectivity(),
      () => this.testMoodDataRetrieval(),
      () => this.testWellnessGoalsRetrieval(),
      () => this.testWellnessInsightsRetrieval(),
      () => this.testMoodEntryCreation(),
      () => this.testDataConsistency()
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.testName}: ${result.message}`);
        
        if (!result.passed && result.error) {
          console.log(`   Error: ${result.error}`);
        }
      } catch (error) {
        const errorResult = this.createTestResult(
          'Unknown Test',
          false,
          'Test execution failed',
          null,
          error instanceof Error ? error.message : 'Unknown error'
        );
        results.push(errorResult);
        console.log(`❌ Test execution failed: ${error}`);
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const successRate = (passed / results.length) * 100;

    const summary = {
      total: results.length,
      passed,
      failed,
      successRate
    };

    console.log('\n📊 Test Suite Summary:');
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.successRate.toFixed(1)}%`);

    if (summary.successRate === 100) {
      console.log('🎉 All tests passed! Wellness data synchronization is working correctly.');
    } else if (summary.successRate >= 80) {
      console.log('⚠️  Most tests passed, but some issues detected. Check failed tests above.');
    } else {
      console.log('🚨 Multiple test failures detected. Wellness data synchronization needs attention.');
    }

    return {
      results,
      summary
    };
  }

  /**
   * Generate detailed test report
   */
  generateReport(testSuite: SyncTestSuite): string {
    const { results, summary } = testSuite;
    
    let report = '# Wellness Data Synchronization Test Report\n\n';
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    report += '## Summary\n\n';
    report += `- **Total Tests:** ${summary.total}\n`;
    report += `- **Passed:** ${summary.passed}\n`;
    report += `- **Failed:** ${summary.failed}\n`;
    report += `- **Success Rate:** ${summary.successRate.toFixed(1)}%\n\n`;
    
    report += '## Test Results\n\n';
    
    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `### ${index + 1}. ${result.testName} - ${status}\n\n`;
      report += `**Message:** ${result.message}\n\n`;
      
      if (result.error) {
        report += `**Error:** ${result.error}\n\n`;
      }
      
      if (result.data) {
        report += `**Data:**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n\n`;
      }
    });
    
    report += '## Recommendations\n\n';
    
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length === 0) {
      report += '- All tests passed! No immediate action required.\n';
      report += '- Continue monitoring wellness data synchronization.\n';
    } else {
      report += '- Review and fix failed tests above.\n';
      report += '- Check API endpoints and database connectivity.\n';
      report += '- Verify authentication tokens and permissions.\n';
      report += '- Test data validation and transformation logic.\n';
    }
    
    return report;
  }
}

// Export utility functions
export const runWellnessSyncTest = async (): Promise<SyncTestSuite> => {
  const tester = new WellnessSyncTester();
  return await tester.runFullTestSuite();
};

export const generateSyncTestReport = (testSuite: SyncTestSuite): string => {
  const tester = new WellnessSyncTester();
  return tester.generateReport(testSuite);
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testWellnessSync = runWellnessSyncTest;
  (window as any).WellnessSyncTester = WellnessSyncTester;
}