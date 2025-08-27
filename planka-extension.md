# Planka Extension Development Guide

This guide explains how to extend Planka with custom functionality. Planka's modular architecture provides several extension points for developers to build upon.

## Table of Contents

1. [Extension Types](#extension-types)
2. [Webhook Integration](#webhook-integration)
3. [Markdown Plugins](#markdown-plugins)
4. [Client-Side Components](#client-side-components)
5. [Server-Side API Extensions](#server-side-api-extensions)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Extension Types

Planka supports several types of extensions:

- **Webhooks**: Real-time event notifications to external systems
- **Markdown Plugins**: Custom text rendering and formatting
- **Component Extensions**: Custom React components for the frontend
- **API Extensions**: Custom server-side endpoints and functionality
- **Theme Extensions**: Custom styling and visual modifications

## Webhook Integration

Webhooks allow you to receive real-time notifications when events occur in Planka. This is the most straightforward way to integrate external services.

### Setting Up Webhooks

1. **Create a Webhook Endpoint**: Set up an HTTP endpoint that can receive POST requests
2. **Register the Webhook**: Use Planka's admin interface or API to register your webhook
3. **Handle Events**: Process incoming webhook payloads in your application

### Webhook Configuration

```javascript
// Example webhook registration via API
POST /api/webhooks
{
  "name": "My Custom Integration",
  "url": "https://my-service.com/planka-webhook",
  "accessToken": "optional-bearer-token",
  "events": "cardCreate,cardUpdate,commentCreate",
  "excludedEvents": "userUpdate"
}
```

### Available Events

Planka supports webhooks for the following events:

#### Card Events
- `cardCreate` - New card created
- `cardUpdate` - Card modified
- `cardDelete` - Card deleted

#### Board Events
- `boardCreate` - New board created
- `boardUpdate` - Board modified
- `boardDelete` - Board deleted

#### Project Events
- `projectCreate` - New project created
- `projectUpdate` - Project modified
- `projectDelete` - Project deleted

#### Comment Events
- `commentCreate` - New comment added
- `commentUpdate` - Comment modified
- `commentDelete` - Comment deleted

#### User Events
- `userCreate` - New user registered
- `userUpdate` - User profile updated
- `userDelete` - User deleted

#### And many more...

For a complete list, see `/server/api/models/Webhook.js` in the source code.

### Webhook Payload Structure

```javascript
{
  "event": "cardCreate",
  "data": {
    "item": {
      "id": "card-uuid",
      "name": "Task Title",
      "description": "Task description",
      "position": 1,
      "listId": "list-uuid",
      "boardId": "board-uuid",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "included": {
      "boards": [...],
      "lists": [...],
      "users": [...]
    }
  },
  "prevData": null, // Previous state for update events
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

## Markdown Plugins

Planka uses a powerful markdown system that can be extended with custom plugins.

### Creating a Markdown Plugin

1. **Create Plugin File**: Add your plugin to `/client/src/configs/markdown-plugins/`
2. **Register Plugin**: Import and add to the plugin array in `index.js`

### Example Plugin

```javascript
// /client/src/configs/markdown-plugins/custom-shortcode.js
export default function customShortcode(md) {
  md.inline.ruler.before('emphasis', 'custom_shortcode', (state, silent) => {
    const start = state.pos;
    const marker = state.src.slice(start, start + 3);
    
    if (marker !== ':::') {
      return false;
    }
    
    // Plugin logic here
    if (!silent) {
      const token = state.push('custom_shortcode_open', 'span', 1);
      token.markup = ':::';
      
      // Process content
      
      const closeToken = state.push('custom_shortcode_close', 'span', -1);
      closeToken.markup = ':::';
    }
    
    return true;
  });
  
  md.renderer.rules.custom_shortcode_open = () => '<span class="custom-shortcode">';
  md.renderer.rules.custom_shortcode_close = () => '</span>';
}
```

### Registering the Plugin

```javascript
// /client/src/configs/markdown-plugins/index.js
import customShortcode from './custom-shortcode';

export default [
  // ... existing plugins
  customShortcode,
];
```

## Client-Side Components

Planka's React frontend can be extended with custom components and functionality.

### Component Structure

```
client/src/components/
├── common/           # Shared components
├── cards/           # Card-related components
├── boards/          # Board-related components
├── projects/        # Project-related components
└── custom/          # Your custom components
```

### Creating Custom Components

1. **Create Component Directory**: Add your component in an appropriate location
2. **Follow Naming Conventions**: Use PascalCase for components
3. **Use CSS Modules**: Follow the existing styling patterns

### Example Custom Component

```javascript
// /client/src/components/cards/CustomCardAction/CustomCardAction.jsx
import React from 'react';
import { Button } from 'semantic-ui-react';
import styles from './CustomCardAction.module.scss';

const CustomCardAction = ({ card, onAction }) => {
  const handleCustomAction = () => {
    // Custom logic here
    onAction(card.id);
  };

  return (
    <Button
      className={styles.customButton}
      content="Custom Action"
      onClick={handleCustomAction}
    />
  );
};

export default CustomCardAction;
```

### Integrating with Existing Components

To integrate your custom component, you'll need to modify existing components or add new routes:

```javascript
// Example: Adding to card actions
import CustomCardAction from '../CustomCardAction';

// In the existing card component
<CustomCardAction 
  card={card}
  onAction={handleCustomAction}
/>
```

## Server-Side API Extensions

Extend Planka's backend with custom API endpoints and business logic.

### Creating Custom Controllers

```javascript
// /server/api/controllers/custom/my-endpoint.js
module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      required: true,
    },
    customData: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    
    // Custom business logic
    const result = await sails.helpers.custom.processCardData
      .with({
        cardId: inputs.cardId,
        data: inputs.customData,
        user: currentUser,
      });

    return {
      success: true,
      data: result,
    };
  },
};
```

### Adding Custom Routes

```javascript
// /server/config/routes.js
module.exports.routes = {
  // ... existing routes
  'POST /api/custom/process-card': 'custom/my-endpoint',
};
```

### Creating Custom Helpers

```javascript
// /server/api/helpers/custom/process-card-data.js
module.exports = {
  friendlyName: 'Process card data',
  description: 'Custom helper for processing card data',

  inputs: {
    cardId: {
      type: 'string',
      required: true,
    },
    data: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    // Custom processing logic
    const card = await Card.findOne(inputs.cardId);
    
    if (!card) {
      throw new Error('Card not found');
    }

    // Perform custom operations
    const processedData = {
      ...inputs.data,
      processedAt: new Date(),
      processedBy: inputs.user.id,
    };

    return processedData;
  },
};
```

## Best Practices

### Security Considerations

1. **Validate Input**: Always validate and sanitize user input
2. **Authentication**: Ensure proper authentication for API endpoints
3. **Authorization**: Check user permissions before operations
4. **Webhook Security**: Verify webhook signatures when possible

### Performance

1. **Async Operations**: Use async/await for database operations
2. **Caching**: Implement caching for expensive operations
3. **Pagination**: Use pagination for large data sets
4. **Database Optimization**: Optimize database queries

### Code Quality

1. **Error Handling**: Implement proper error handling
2. **Logging**: Add appropriate logging for debugging
3. **Testing**: Write tests for your extensions
4. **Documentation**: Document your extensions

### Compatibility

1. **Version Compatibility**: Ensure compatibility with Planka versions
2. **Database Migrations**: Handle database schema changes properly
3. **API Versioning**: Consider API versioning for breaking changes

## Examples

### Example 1: Slack Integration Webhook

```javascript
// External service receiving Planka webhooks
app.post('/planka-webhook', (req, res) => {
  const { event, data, user } = req.body;
  
  if (event === 'cardCreate') {
    const message = {
      text: `New card created: ${data.item.name}`,
      channel: '#planka-updates',
      username: user.name,
    };
    
    // Send to Slack
    slack.sendMessage(message);
  }
  
  res.status(200).send('OK');
});
```

### Example 2: Time Tracking Extension

```javascript
// Custom time tracking component
const TimeTracker = ({ cardId }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = async () => {
    const response = await api.post('/api/custom/time-tracking/start', {
      cardId,
    });
    setIsTracking(true);
  };

  const stopTracking = async () => {
    const response = await api.post('/api/custom/time-tracking/stop', {
      cardId,
    });
    setIsTracking(false);
    loadTimeEntries();
  };

  return (
    <div className="time-tracker">
      <Button 
        primary={!isTracking}
        negative={isTracking}
        onClick={isTracking ? stopTracking : startTracking}
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </Button>
      {/* Time entries list */}
    </div>
  );
};
```

### Example 3: Custom Field Plugin

```javascript
// Custom field type for markdown plugin
export default function customFieldPlugin(md) {
  md.inline.ruler.after('emphasis', 'custom_field', (state, silent) => {
    const start = state.pos;
    const marker = state.src.slice(start, start + 2);
    
    if (marker !== '{{') {
      return false;
    }
    
    const end = state.src.indexOf('}}', start + 2);
    if (end === -1) {
      return false;
    }
    
    const fieldName = state.src.slice(start + 2, end);
    
    if (!silent) {
      const token = state.push('custom_field', '', 0);
      token.content = fieldName;
      token.markup = '{{}}';
    }
    
    state.pos = end + 2;
    return true;
  });
  
  md.renderer.rules.custom_field = (tokens, idx) => {
    const fieldName = tokens[idx].content;
    return `<span class="custom-field" data-field="${fieldName}">{{${fieldName}}}</span>`;
  };
}
```

## Development Setup

1. **Fork Planka**: Create a fork of the Planka repository
2. **Local Development**: Set up local development environment
3. **Extension Development**: Develop your extensions following this guide
4. **Testing**: Test your extensions thoroughly
5. **Documentation**: Document your extensions
6. **Contribution**: Consider contributing back to the main project

## Resources

- [Planka Documentation](https://docs.planka.cloud/)
- [Sails.js Documentation](https://sailsjs.com/documentation)
- [React Documentation](https://reactjs.org/docs)
- [Markdown-it Documentation](https://markdown-it.github.io/)

## Support

For extension development questions:
- Join the [Discord Community](https://discord.gg/WqqYNd7Jvt)
- Check [GitHub Discussions](https://github.com/plankanban/planka/discussions)
- Review the source code for examples

---

*This documentation is for Planka v2.0.0+. For older versions, please check the version-specific documentation.*