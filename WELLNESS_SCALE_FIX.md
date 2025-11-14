# Wellness Overview Scale Fix

## Problem
The Wellness Overview was displaying scores above 10 (showing 6 instead of 3, for example) because the code was incorrectly multiplying the 1-5 scale values by 2.

### Before:
- Mood: 6 (should be 3)
- Stress: 6 (should be 3)
- Progress bars calculated for 1-10 scale
- Mood labels based on 1-10 scale

## Root Cause
The code had comments suggesting a "2-10 scale" conversion, but the actual data uses a 1-5 scale:
- Mood entries: 1-5 scale (1=Very Low, 5=Excellent)
- Stress entries: 1-5 scale (1=Minimal, 5=Overwhelming)

The multiplication by 2 was causing incorrect display values.

## Solution

### Changes Made to `WellnessOverview.tsx`:

1. **Removed scale conversion in mood entries:**
   ```typescript
   // Before:
   mood: entry.moodScore * 2, // Convert 1-5 scale to 2-10 scale
   
   // After:
   mood: entry.moodScore, // Keep 1-5 scale
   ```

2. **Fixed average mood calculation:**
   ```typescript
   // Before:
   const avgMood = (sum / length) * 2
   
   // After:
   const avgMood = sum / length
   ```

3. **Fixed average stress calculation:**
   ```typescript
   // Before:
   avgStress = (sum / length) * 2
   
   // After:
   avgStress = sum / length
   ```

4. **Fixed trend calculation:**
   ```typescript
   // Before:
   const difference = (secondAvg - firstAvg) * 2; // Scale to 10-point scale
   
   // After:
   const difference = secondAvg - firstAvg; // Keep on 1-5 scale
   ```

5. **Updated progress bar calculation:**
   ```typescript
   // Before:
   style={{ width: `${(metric.value / 10) * 100}%` }}
   
   // After:
   style={{ width: `${(metric.value / 5) * 100}%` }}
   ```

6. **Updated mood emoji thresholds (1-5 scale):**
   ```typescript
   // Before: 9, 7, 5, 3
   // After: 5, 4, 3, 2
   if (mood >= 5) return '😄';  // Excellent
   if (mood >= 4) return '😊';  // Good
   if (mood >= 3) return '😐';  // Okay
   if (mood >= 2) return '😟';  // Low
   return '😢';                  // Very Low
   ```

7. **Updated mood display badge:**
   ```typescript
   // Before:
   <span>{entry.mood}/10</span>
   
   // After:
   <span>{entry.mood}/5</span>
   ```

8. **Updated color thresholds:**
   ```typescript
   // Before: >= 8, >= 6, >= 4
   // After: >= 4.5, >= 3.5, >= 2.5
   entry.mood >= 4.5 ? 'green' :   // Excellent/Good
   entry.mood >= 3.5 ? 'yellow' :  // Okay
   entry.mood >= 2.5 ? 'orange' :  // Low
   'red'                            // Very Low
   ```

## Result

### Now Displays Correctly:
- **Mood scores:** 1-5 scale (e.g., 3/5 instead of 6/10)
- **Stress scores:** 1-5 scale (e.g., 2/5 instead of 4/10)
- **Progress bars:** Correctly calculated for 1-5 scale
- **Mood labels:** Appropriate for 1-5 scale
- **Color coding:** Matches 1-5 scale thresholds

### Scale Reference:
**Mood (1-5):**
- 5 = Excellent 😄 (Green)
- 4 = Good 😊 (Green)
- 3 = Okay 😐 (Yellow)
- 2 = Low 😟 (Orange)
- 1 = Very Low 😢 (Red)

**Stress (1-5):**
- 5 = Overwhelming (Red)
- 4 = High (Orange)
- 3 = Moderate (Yellow)
- 2 = Low (Light Yellow)
- 1 = Minimal (Green)

## Files Modified
- `apps/web/src/components/dashboard/WellnessOverview.tsx`

## Testing
To verify the fix:
1. Add a mood entry with score 3
2. Check that it displays as "3" not "6"
3. Verify progress bar shows 60% (3/5) not 30% (3/10)
4. Confirm emoji and color match the 1-5 scale
