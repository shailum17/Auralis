'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Progress,
  CircularProgress,
  Skeleton,
  SkeletonCard,
  LineChart,
  BarChart,
  PieChart,
} from '../index';
import { ThemeToggle } from '@/contexts/ThemeContext';

// Sample data for charts
const lineChartData = [
  { month: 'Jan', users: 400, sessions: 240 },
  { month: 'Feb', users: 300, sessions: 139 },
  { month: 'Mar', users: 200, sessions: 980 },
  { month: 'Apr', users: 278, sessions: 390 },
  { month: 'May', users: 189, sessions: 480 },
  { month: 'Jun', users: 239, sessions: 380 },
];

const barChartData = [
  { category: 'Desktop', value: 186 },
  { category: 'Mobile', value: 305 },
  { category: 'Tablet', value: 237 },
  { category: 'Other', value: 73 },
];

const pieChartData = [
  { name: 'Chrome', value: 45, color: '#3b82f6' },
  { name: 'Firefox', value: 25, color: '#ef4444' },
  { name: 'Safari', value: 20, color: '#22c55e' },
  { name: 'Edge', value: 10, color: '#f59e0b' },
];

export function UIShowcase() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(65);
  const [inputValue, setInputValue] = useState('');

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-secondary-900">
            Enhanced UI Component Library
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            A comprehensive design system with modern components, animations, and data visualization
          </p>
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Enhanced button components with variants, sizes, and animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  With Icon
                </Button>
                <Button
                  variant="outline"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  }
                  iconPosition="right"
                >
                  Right Icon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Enhanced input fields with validation, floating labels, and animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter your name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <Input
                label="Floating Label"
                placeholder="Enter your email"
                floating
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              
              <Input
                label="With Error"
                placeholder="Enter password"
                type="password"
                error="Password must be at least 8 characters"
                state="error"
              />
              
              <Input
                label="Success State"
                placeholder="Username"
                value="john_doe"
                state="success"
                helperText="Username is available"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge size="xs">Extra Small</Badge>
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="primary"
                    removable
                    onRemove={() => console.log('Badge removed')}
                  >
                    Removable
                  </Badge>
                  <Badge
                    variant="success"
                    icon={
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  >
                    With Icon
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>Linear and circular progress bars</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Progress
                  value={progress}
                  showLabel
                  label="Upload Progress"
                />
                
                <Progress
                  value={75}
                  variant="success"
                  striped
                  animated
                  showLabel
                  label="Success Progress"
                />
                
                <div className="flex justify-center">
                  <CircularProgress
                    value={progress}
                    label="Completion"
                    variant="primary"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    Decrease
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    Increase
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <LineChart
            title="User Growth"
            description="Monthly active users and sessions"
            data={lineChartData}
            lines={[
              { dataKey: 'users', name: 'Users', color: '#3b82f6' },
              { dataKey: 'sessions', name: 'Sessions', color: '#22c55e' },
            ]}
            xAxisKey="month"
            height={300}
          />
          
          <BarChart
            title="Device Usage"
            description="Traffic by device type"
            data={barChartData}
            bars={[{ dataKey: 'value', name: 'Users' }]}
            xAxisKey="category"
            height={300}
            colorScheme="info"
          />
          
          <PieChart
            title="Browser Share"
            description="Market share by browser"
            data={pieChartData}
            height={300}
            donut
          />
        </div>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Skeleton components for loading states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-4">Card Skeleton</h4>
                <SkeletonCard variant="shimmer" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-4">Custom Skeleton</h4>
                <div className="space-y-3">
                  <Skeleton height="2rem" width="60%" variant="shimmer" />
                  <Skeleton height="1rem" variant="shimmer" />
                  <Skeleton height="1rem" width="80%" variant="shimmer" />
                  <div className="flex gap-4">
                    <Skeleton circle width={40} height={40} variant="shimmer" />
                    <div className="flex-1 space-y-2">
                      <Skeleton height="1rem" width="70%" variant="shimmer" />
                      <Skeleton height="0.75rem" width="50%" variant="shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" asMotion>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with subtle shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-600">
                This is a default card with standard styling and hover effects.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" asMotion>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with enhanced shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-600">
                This card has a more prominent shadow for emphasis.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" interactive asMotion>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Clickable card with gradient background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-600">
                This card is interactive and has a subtle gradient background.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}