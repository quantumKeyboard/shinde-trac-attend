# Shared Utilities and Types

This folder can contain shared code between mobile PWA and desktop app.

## Structure

```
shared/
├── types/          # TypeScript types/interfaces
├── utils/          # Utility functions
├── constants/      # Shared constants
└── validation/     # Validation schemas
```

## Usage

Import shared utilities in both apps:
```javascript
import { formatCurrency } from '../shared/utils/format';
```

## Future Enhancements

- Shared TypeScript types
- Common validation schemas
- Reusable utility functions
- Shared constants and enums
