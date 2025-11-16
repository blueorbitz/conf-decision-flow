# Atlaskit Components Reference

Quick reference for Atlaskit components used in this project.

## Installation

```bash
npm install @atlaskit/button @atlaskit/textfield @atlaskit/textarea @atlaskit/select \
  @atlaskit/modal-dialog @atlaskit/dynamic-table @atlaskit/lozenge @atlaskit/spinner \
  @atlaskit/radio @atlaskit/checkbox @atlaskit/datetime-picker @atlaskit/tabs \
  @atlaskit/section-message @atlaskit/form @atlaskit/icon @atlaskit/css-reset \
  @atlaskit/primitives @atlaskit/tokens
```

## Common Components

### Button
```javascript
import Button from '@atlaskit/button';

<Button appearance="primary" onClick={handleClick}>
  Save
</Button>

// Appearances: default, primary, subtle, link, warning, danger
```

### TextField
```javascript
import Textfield from '@atlaskit/textfield';

<Textfield
  name="fieldName"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### TextArea
```javascript
import TextArea from '@atlaskit/textarea';

<TextArea
  name="description"
  placeholder="Enter description"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>
```

### Select
```javascript
import Select from '@atlaskit/select';

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' }
];

<Select
  options={options}
  value={selectedOption}
  onChange={setSelectedOption}
  placeholder="Choose an option"
/>
```

### Modal Dialog
```javascript
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';

<ModalTransition>
  {isOpen && (
    <Modal onClose={handleClose}>
      <ModalHeader>
        <ModalTitle>Modal Title</ModalTitle>
      </ModalHeader>
      <ModalBody>
        Content here
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={handleClose}>Cancel</Button>
        <Button appearance="primary" onClick={handleSave}>Save</Button>
      </ModalFooter>
    </Modal>
  )}
</ModalTransition>
```

### Dynamic Table
```javascript
import DynamicTable from '@atlaskit/dynamic-table';

const head = {
  cells: [
    { key: 'name', content: 'Name', isSortable: true },
    { key: 'status', content: 'Status' },
    { key: 'actions', content: 'Actions' }
  ]
};

const rows = data.map((item, index) => ({
  key: `row-${index}`,
  cells: [
    { key: 'name', content: item.name },
    { key: 'status', content: <Lozenge>{item.status}</Lozenge> },
    { key: 'actions', content: <Button>Edit</Button> }
  ]
}));

<DynamicTable
  head={head}
  rows={rows}
  isLoading={loading}
  emptyView={<h3>No data</h3>}
/>
```

### Radio Group
```javascript
import { RadioGroup } from '@atlaskit/radio';

const options = [
  { name: 'option', value: '1', label: 'Option 1' },
  { name: 'option', value: '2', label: 'Option 2' }
];

<RadioGroup
  options={options}
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
/>
```

### Checkbox Group
```javascript
import { Checkbox } from '@atlaskit/checkbox';

<Checkbox
  value="option1"
  label="Option 1"
  isChecked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

### Date Picker
```javascript
import { DatePicker } from '@atlaskit/datetime-picker';

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>
```

### Tabs
```javascript
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';

<Tabs id="flow-tabs">
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanel>Content 1</TabPanel>
  <TabPanel>Content 2</TabPanel>
</Tabs>
```

### Section Message
```javascript
import SectionMessage from '@atlaskit/section-message';

<SectionMessage appearance="success">
  <p>Operation completed successfully!</p>
</SectionMessage>

// Appearances: info, warning, error, success, discovery
```

### Lozenge
```javascript
import Lozenge from '@atlaskit/lozenge';

<Lozenge appearance="success">Completed</Lozenge>

// Appearances: default, success, removed, inprogress, new, moved
```

### Spinner
```javascript
import Spinner from '@atlaskit/spinner';

<Spinner size="large" />
// Sizes: small, medium, large, xlarge
```

### Form
```javascript
import Form, { Field, ErrorMessage, HelperMessage } from '@atlaskit/form';

<Form onSubmit={handleSubmit}>
  {({ formProps }) => (
    <form {...formProps}>
      <Field name="username" label="Username" isRequired>
        {({ fieldProps, error }) => (
          <>
            <Textfield {...fieldProps} />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
      </Field>
      <Button type="submit" appearance="primary">Submit</Button>
    </form>
  )}
</Form>
```

## Styling Tips

### Using Design Tokens
```javascript
import { token } from '@atlaskit/tokens';

const styles = {
  container: {
    padding: token('space.200'),
    backgroundColor: token('color.background.neutral'),
    borderRadius: token('border.radius')
  }
};
```

### Common Tokens
- **Spacing**: `space.050`, `space.100`, `space.200`, `space.300`
- **Colors**: 
  - `color.background.neutral`
  - `color.background.success`
  - `color.text`
  - `color.border`
- **Border**: `border.radius`, `border.width`

## React Flow Integration

### Basic Setup
```javascript
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { token } from '@atlaskit/tokens';

// Custom node with Atlaskit
function CustomNode({ data }) {
  return (
    <div style={{ 
      padding: token('space.100'),
      backgroundColor: token('color.background.neutral'),
      borderRadius: token('border.radius')
    }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

## Common Patterns

### Loading State
```javascript
{loading ? (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <Spinner size="large" />
  </div>
) : (
  <Content />
)}
```

### Empty State
```javascript
{items.length === 0 ? (
  <SectionMessage appearance="info">
    <p>No items found. Create your first item to get started.</p>
  </SectionMessage>
) : (
  <ItemList items={items} />
)}
```

### Error Handling
```javascript
{error && (
  <SectionMessage appearance="error">
    <p>{error.message}</p>
  </SectionMessage>
)}
```
