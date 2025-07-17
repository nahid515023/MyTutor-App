# Loading Components Documentation

This directory contains reusable loading components that can be used throughout the MyTutor application.

## Components

### 1. LoadingState
A full-featured loading component with animated spinner, title, message, and bouncing dots.

#### Usage:
```tsx
import LoadingState from '@/components/loading/LoadingState'

// Basic usage
<LoadingState />

// With custom content
<LoadingState
  title="Loading Tutors"
  message="Finding the best tutors for you..."
  size="large"
  className="my-4"
/>
```

#### Props:
- `title?: string` - Loading title (default: "Loading...")
- `message?: string` - Loading message (default: "Please wait while we process your request...")
- `className?: string` - Additional CSS classes
- `size?: 'small' | 'medium' | 'large'` - Component size (default: 'medium')

#### Sizes:
- **small**: h-48, good for cards or small sections
- **medium**: h-96, good for main content areas
- **large**: h-[32rem], good for full page sections

---

### 2. LoadingSpinner
A simple, lightweight spinner for buttons and inline usage.

#### Usage:
```tsx
import LoadingSpinner from '@/components/loading/LoadingSpinner'

// Basic usage
<LoadingSpinner />

// In a button
<button disabled>
  <LoadingSpinner size="sm" color="white" className="mr-2" />
  Processing...
</button>
```

#### Props:
- `size?: 'xs' | 'sm' | 'md' | 'lg'` - Spinner size (default: 'md')
- `className?: string` - Additional CSS classes
- `color?: 'blue' | 'white' | 'gray' | 'amber'` - Spinner color (default: 'blue')

---

### 3. FullPageLoading
A full-screen loading overlay for app initialization or major transitions.

#### Usage:
```tsx
import FullPageLoading from '@/components/loading/FullPageLoading'

// Basic usage
<FullPageLoading />

// With custom content and visibility control
<FullPageLoading
  title="Initializing MyTutor"
  message="Setting up your learning environment..."
  isVisible={isAppLoading}
/>
```

#### Props:
- `title?: string` - Loading title (default: "Loading Application")
- `message?: string` - Loading message (default: "Please wait while we prepare everything for you...")
- `isVisible?: boolean` - Controls visibility (default: true)

---

## Example Use Cases

### 1. Page Loading (like tutors page)
```tsx
{isLoading ? (
  <LoadingState
    title="Finding Your Tutors"
    message="We're matching you with the perfect tutors for your needs..."
    size="large"
  />
) : (
  // Your content here
)}
```

### 2. Button Loading
```tsx
<button 
  onClick={handleSubmit} 
  disabled={isSubmitting}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  {isSubmitting ? (
    <>
      <LoadingSpinner size="sm" color="white" className="mr-2" />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### 3. App Initialization
```tsx
function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  
  return (
    <>
      <FullPageLoading
        title="Welcome to MyTutor"
        message="Loading your personalized learning experience..."
        isVisible={isInitializing}
      />
      {!isInitializing && <MainApp />}
    </>
  )
}
```

### 4. Card Loading
```tsx
<div className="grid grid-cols-3 gap-4">
  {isLoading ? (
    Array.from({ length: 6 }).map((_, i) => (
      <LoadingState key={i} size="small" />
    ))
  ) : (
    items.map(item => <ItemCard key={item.id} {...item} />)
  )}
</div>
```

## Design Features

All loading components include:
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Consistent styling with the app theme
- ✅ Accessibility considerations
- ✅ TypeScript support

## Color Scheme

The components use the app's consistent color palette:
- **Primary**: Blue (#3B82F6)
- **Secondary**: Amber (#F59E0B)
- **Background**: White/Gray-800 (light/dark mode)
- **Text**: Gray-800/Gray-200 (light/dark mode)
- **Borders**: Gray-100/Gray-700 (light/dark mode)
