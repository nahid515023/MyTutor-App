# Implementation Guide: Using Loading Components Across MyTutor App

This guide shows how to implement the reusable loading components throughout your MyTutor application.

## Quick Implementation Checklist

### 1. ✅ **Tutors Page** (Already Updated)
- **File**: `/app/(root)/tutors/page.tsx`
- **Component**: `LoadingState`
- **Usage**: Full page loading while fetching tutors

```tsx
{isLoading ? (
  <LoadingState
    title="Finding Your Tutors"
    message="We're matching you with the perfect tutors for your needs..."
    size="large"
  />
) : (
  // Tutors content
)}
```

### 2. ✅ **Login Form** (Already Updated)
- **File**: `/components/auth/LoginForm.tsx`
- **Component**: `LoadingSpinner`
- **Usage**: Button loading state during authentication

```tsx
{isLoading ? (
  <div className='flex items-center justify-center'>
    <LoadingSpinner size="sm" color="white" className="mr-2" />
    Signing in...
  </div>
) : (
  'Sign In'
)}
```

## Recommended Implementations

### 3. **Dashboard Page**
**File**: `/app/(dashboard)/dashboard/page.tsx`

```tsx
import LoadingState from '@/components/loading/LoadingState'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isLoading ? (
        <LoadingState
          title="Loading Dashboard"
          message="Preparing your personalized learning dashboard..."
          size="large"
        />
      ) : (
        // Dashboard content
      )}
    </div>
  )
}
```

### 4. **Meeting Room Page**
**File**: `/app/(meeting-room)/meeting-room/[id]/page.tsx`

```tsx
import LoadingState from '@/components/loading/LoadingState'

export default function MeetingRoomPage() {
  const [isConnecting, setIsConnecting] = useState(true)
  
  return (
    <>
      {isConnecting ? (
        <LoadingState
          title="Connecting to Meeting"
          message="Setting up your video call..."
          size="large"
          className="fixed inset-0 z-50"
        />
      ) : (
        // Meeting room interface
      )}
    </>
  )
}
```

### 5. **Create Post Page**
**File**: `/app/(root)/create-post/page.tsx`

```tsx
import LoadingSpinner from '@/components/loading/LoadingSpinner'

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Publishing Post...
          </>
        ) : (
          'Publish Post'
        )}
      </button>
    </form>
  )
}
```

### 6. **Profile Page with Dynamic Content**
**File**: `/app/(root)/profile/[id]/page.tsx`

```tsx
import { LoadingState, LoadingSpinner } from '@/components/loading'

export default function ProfilePage() {
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  
  if (isProfileLoading) {
    return (
      <LoadingState
        title="Loading Profile"
        message="Fetching user information..."
        size="large"
      />
    )
  }
  
  return (
    <div>
      {/* Profile content */}
      
      <button
        onClick={handleFollow}
        disabled={isFollowing}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isFollowing ? (
          <>
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Following...
          </>
        ) : (
          'Follow'
        )}
      </button>
    </div>
  )
}
```

### 7. **Chat/Messages Loading**
**File**: `/app/(root)/chats/page.tsx`

```tsx
import LoadingState from '@/components/loading/LoadingState'

export default function ChatsPage() {
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [chats, setChats] = useState([])
  
  return (
    <div className="h-screen flex">
      <div className="w-1/3 border-r">
        {isLoadingChats ? (
          <LoadingState
            title="Loading Chats"
            message="Fetching your conversations..."
            size="medium"
            className="h-full"
          />
        ) : (
          // Chat list
        )}
      </div>
      
      <div className="flex-1">
        {/* Chat content */}
      </div>
    </div>
  )
}
```

### 8. **App-wide Loading (Root Layout)**
**File**: `/app/layout.tsx`

```tsx
import FullPageLoading from '@/components/loading/FullPageLoading'

export default function RootLayout({ children }) {
  const [isAppInitializing, setIsAppInitializing] = useState(true)
  
  useEffect(() => {
    // App initialization logic
    const initializeApp = async () => {
      // Check auth, load user preferences, etc.
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate loading
      setIsAppInitializing(false)
    }
    
    initializeApp()
  }, [])
  
  return (
    <html>
      <body>
        <FullPageLoading
          title="Welcome to MyTutor"
          message="Initializing your learning experience..."
          isVisible={isAppInitializing}
        />
        
        {!isAppInitializing && children}
      </body>
    </html>
  )
}
```

### 9. **Search Results Loading**
**File**: `/app/(root)/search/page.tsx`

```tsx
import LoadingState from '@/components/loading/LoadingState'

export default function SearchPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  
  return (
    <div>
      <SearchForm onSearch={handleSearch} />
      
      {isSearching ? (
        <LoadingState
          title="Searching..."
          message="Finding the best matches for your query..."
          size="medium"
        />
      ) : (
        <SearchResults results={results} />
      )}
    </div>
  )
}
```

### 10. **Form Submissions**
For any form with submission states:

```tsx
import LoadingSpinner from '@/components/loading/LoadingSpinner'

// In any form component
<button
  type="submit"
  disabled={isSubmitting}
  className="btn-primary"
>
  {isSubmitting ? (
    <>
      <LoadingSpinner size="sm" color="white" className="mr-2" />
      {submitText || 'Submitting...'}
    </>
  ) : (
    buttonText
  )}
</button>
```

## Best Practices

### 1. **Choose the Right Component**
- **LoadingState**: Full sections, page content
- **LoadingSpinner**: Buttons, inline elements
- **FullPageLoading**: App initialization, major transitions

### 2. **Consistent Messaging**
- Use specific, user-friendly messages
- Match the action being performed
- Keep messages concise but informative

### 3. **Size Guidelines**
- **small**: Cards, sidebar sections
- **medium**: Main content areas
- **large**: Full page content

### 4. **Performance Tips**
- Don't show loading for very quick operations (< 300ms)
- Use skeleton screens for complex layouts
- Provide progress indicators for long operations

### 5. **Accessibility**
- All components include proper ARIA attributes
- Loading states are announced to screen readers
- Focus management during loading transitions

## Testing Checklist

- [ ] Loading states work in both light and dark modes
- [ ] Animations are smooth and not overwhelming
- [ ] Loading messages are appropriate for each context
- [ ] Disabled states prevent multiple submissions
- [ ] Loading states are accessible
- [ ] Components work across different screen sizes
