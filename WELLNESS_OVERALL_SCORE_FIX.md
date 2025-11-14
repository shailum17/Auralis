# Wellness Overall Score Calculation Fix

## Problem
The overall wellness score was only showing the mood average (3), not combining both mood and stress metrics.

### Example Issue:
- **Mood:** 3
- **Stress:** 4
- **Overall Score Shown:** 3 (incorrect)
- **Expected:** Should combine both metrics

## Root Cause
The code was calculating the overall score as:
```typescript
const overallScore = Math.round(avgMood * 10) / 10;
```

This only used the mood value and completely ignored the stress value.

## Solution

### New Calculation Formula
The overall wellness score now properly combines both mood and stress:

```typescript
// Invert stress (higher stress = worse wellness)
const invertedStress = avgStress > 0 ? (6 - avgStress) : 0;

// Average mood and inverted stress
const overallScore = avgMood > 0 && avgStress > 0 
  ? Math.round(((avgMood + invertedStress) / 2) * 10) / 10
  : avgMood > 0 
    ? Math.round(avgMood * 10) / 10
    : 0;
```

### Why Invert Stress?
- **Mood Scale:** 1 (bad) → 5 (good) - Higher is better
- **Stress Scale:** 1 (minimal) → 5 (overwhelming) - Lower is better

To combine them fairly, we invert stress:
- Stress 5 (overwhelming) → becomes 1 (bad for wellness)
- Stress 1 (minimal) → becomes 5 (good for wellness)

### Formula: `(6 - stress)`
- Stress 5 → 6 - 5 = 1
- Stress 4 → 6 - 4 = 2
- Stress 3 → 6 - 3 = 3
- Stress 2 → 6 - 2 = 4
- Stress 1 → 6 - 1 = 5

### Example Calculations

**Example 1: Your Case**
- Mood: 3
- Stress: 4
- Inverted Stress: 6 - 4 = 2
- Overall: (3 + 2) / 2 = **2.5**

**Example 2: Good Wellness**
- Mood: 5 (excellent)
- Stress: 1 (minimal)
- Inverted Stress: 6 - 1 = 5
- Overall: (5 + 5) / 2 = **5.0** (perfect wellness)

**Example 3: Poor Wellness**
- Mood: 2 (low)
- Stress: 5 (overwhelming)
- Inverted Stress: 6 - 5 = 1
- Overall: (2 + 1) / 2 = **1.5** (poor wellness)

**Example 4: Mixed**
- Mood: 4 (good)
- Stress: 3 (moderate)
- Inverted Stress: 6 - 3 = 3
- Overall: (4 + 3) / 2 = **3.5** (decent wellness)

## Trend Calculation

The overall trend now also combines both mood and stress trends:

```typescript
const calculateCombinedTrend = (moodTrend: string, stressTrend: string) => {
  const moodValue = parseFloat(moodTrend);
  const stressValue = parseFloat(stressTrend);
  
  // Invert stress trend (decreasing stress = improving wellness)
  const invertedStressTrend = -stressValue;
  
  // Average the two trends
  const combined = (moodValue + invertedStressTrend) / 2;
  
  return combined >= 0 ? `+${combined.toFixed(1)}` : combined.toFixed(1);
};
```

### Trend Examples

**Example 1:**
- Mood Trend: +4.0 (improving)
- Stress Trend: -2.0 (decreasing - good!)
- Inverted Stress Trend: +2.0
- Overall Trend: (+4.0 + 2.0) / 2 = **+3.0** (improving)

**Example 2:**
- Mood Trend: +1.0 (slightly improving)
- Stress Trend: +3.0 (increasing - bad!)
- Inverted Stress Trend: -3.0
- Overall Trend: (+1.0 - 3.0) / 2 = **-1.0** (declining)

## Edge Cases Handled

1. **Only Mood Data (No Stress):**
   - Uses mood average as overall score
   - Uses mood trend as overall trend

2. **Only Stress Data (No Mood):**
   - Overall score = 0 (no data)

3. **No Data:**
   - Overall score = 0
   - Trend = +0.0

## Result

### Before Fix:
- Mood: 3, Stress: 4 → Overall: **3** ❌

### After Fix:
- Mood: 3, Stress: 4 → Overall: **2.5** ✅
  - Calculation: (3 + (6-4)) / 2 = (3 + 2) / 2 = 2.5

The overall score now accurately reflects both mood and stress levels!

## Files Modified
- `apps/web/src/components/dashboard/WellnessOverview.tsx`

## Wellness Score Interpretation

**5.0 - 4.5:** Excellent wellness 😄
**4.4 - 3.5:** Good wellness 😊
**3.4 - 2.5:** Moderate wellness 😐
**2.4 - 1.5:** Low wellness 😟
**1.4 - 1.0:** Poor wellness 😢

## Testing

To verify the fix:
1. Add mood entry with score 3
2. Add stress entry with score 4
3. Check overall score shows approximately 2.5
4. Verify it updates when either metric changes
